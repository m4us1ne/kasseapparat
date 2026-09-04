group "default" {
  targets = ["kasseapparat"]
}

# Set from CI so a fork labels its images with its own repository.
# org.opencontainers.image.source is what links the pushed package to a
# GitHub repo, so it has to match whoever is building.
variable "IMAGE_SOURCE" {
  default = "https://github.com/potibm/kasseapparat"
}

variable "IMAGE_AUTHORS" {
  default = "potibm"
}

target "kasseapparat" {
  context    = "."
  dockerfile = "Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]

  labels = {
    "org.opencontainers.image.url" = "${IMAGE_SOURCE}"
    "org.opencontainers.image.source" = "${IMAGE_SOURCE}"
    "org.opencontainers.image.documentation" = "${IMAGE_SOURCE}/tree/main/doc"
    "org.opencontainers.image.authors" = "${IMAGE_AUTHORS}"
  }

  attest = [
    "type=sbom",
    "type=provenance,mode=max"
  ]

  annotations = [
    "index,manifest:org.opencontainers.image.title=Kasseapparat",
    "index,manifest:org.opencontainers.image.description=A POS system for demoparties",
    "index,manifest:org.opencontainers.image.url=${IMAGE_SOURCE}",
    "index,manifest:org.opencontainers.image.source=${IMAGE_SOURCE}",
    "index,manifest:org.opencontainers.image.documentation=${IMAGE_SOURCE}/tree/main/doc",
    "index,manifest:org.opencontainers.image.licenses=MIT",
    "index,manifest:org.opencontainers.image.authors=${IMAGE_AUTHORS}"
  ]
}
