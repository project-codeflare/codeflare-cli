cask "codeflare" do
  version "0.0.4"

  name "CodeFlare"
  desc "CLI for Project CodeFlare"
  homepage "https://github.com/project-codeflare/codeflare-cli"

  if Hardware::CPU.intel?
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-x64.tar.bz2"
    sha256 "caa5d77d0e826b8c6e7a078d4c2041b26d6b30c602c996631e5b5a6d8f8e7ba3"
    app "CodeFlare-darwin-x64/CodeFlare.app"
  else
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-amd64.tar.bz2"
    sha256 "413248c8d4d940f5e7c0b6c9ad585e51d2b2239ee628debbce939ed2c5016005"
    app "CodeFlare-darwin-amd64/CodeFlare.app"
  end

  livecheck do
    url :url
    strategy :git
    regex(/^v(\d+(?:\.\d+)*)$/)
  end

  binary "#{appdir}/CodeFlare.app/Contents/Resources/codeflare"

  zap trash: "~/Library/Application\ Support/CodeFlare"
end
