{
  description = "Kasseapparat development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          name = "kasseapparat";

          packages = with pkgs; [
            # Backend — versions track .mise/config.toml
            go_1_26 # mise pins 1.26.5; nixpkgs ships 1.26.7
            gopls
            delve
            golangci-lint # mise pins 2.12.2; nixpkgs ships 2.13.2
            air # hot reload, `mise run be:dev`
            go-licenses

            # Frontend
            nodejs_26

            # Repo tooling
            overmind
            actionlint
            shellcheck
            dotenv-linter
            vale
            jq
            mkcert # local TLS certs for the kasseapparat.test host
          ];

          env = {
            # Matches the release Dockerfile: SQLite is a pure-Go driver since 3.0.0.
            CGO_ENABLED = "0";
            # go.mod requests 1.26.5; use the pinned toolchain instead of downloading one.
            GOTOOLCHAIN = "local";
          };

          shellHook = ''
            # Keep `go install`ed helpers (e.g. gomajor, which is not in nixpkgs)
            # inside the repo rather than in ~/go/bin.
            export GOBIN="$PWD/.gobin"
            export PATH="$GOBIN:$PATH"

            echo "kasseapparat  go $(go env GOVERSION | sed 's/^go//')  node $(node --version | tr -d v)"
            echo "backend: go run . serve   frontend: npm ci && npx vite"
          '';
        };
      });
    };
}
