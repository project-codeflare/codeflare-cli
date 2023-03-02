cask "codeflare" do
  version "2.13.0"

  name "CodeFlare"
  desc "CLI for Project CodeFlare"
  homepage "https://github.com/project-codeflare/codeflare-cli"

  if Hardware::CPU.intel?
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-x64.tar.bz2"
    sha256 "0c67f62185cd4eb4611570e9bcb64c884ff19aebb557a4ddbeb4b9aa8cf4a31f"
    app "CodeFlare-darwin-x64/CodeFlare.app"
  else
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-arm64.tar.bz2"
    sha256 "ccdc282fc8e31fd5c722e511b64269d21d54765a0327b3043f2eaa226c60b692"
    app "CodeFlare-darwin-arm64/CodeFlare.app"
  end

  livecheck do
    url :url
    strategy :git
    regex(/^v(\d+(?:\.\d+)*)$/)
  end

  binary "#{appdir}/CodeFlare.app/Contents/Resources/codeflare"

  zap trash: "~/Library/Application\ Support/CodeFlare"
end
