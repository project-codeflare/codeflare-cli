cask "codeflare" do
  version "0.0.3"

  name "CodeFlare"
  desc "CLI for Project CodeFlare"
  homepage "https://github.com/project-codeflare/codeflare-cli"

  if Hardware::CPU.intel?
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-x64.tar.bz2"
    sha256 "e89a6627b62e9f9da0598a20e5f28c58a273a7cac14a80d44a299011a16b965d"
    app "CodeFlare-darwin-x64/CodeFlare.app"
  else
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-amd64.tar.bz2"
    sha256 "6e007ed6cba041ea058ee7f427cb306409ba8914ae117cccc2c2e36bf7538de7"
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
