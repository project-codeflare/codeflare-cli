cask "codeflare" do
  version "2.1.2"

  name "CodeFlare"
  desc "CLI for Project CodeFlare"
  homepage "https://github.com/project-codeflare/codeflare-cli"

  if Hardware::CPU.intel?
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-x64.tar.bz2"
    sha256 "36baeb474411b8baaa2da4db48ee0f422133f7c12d3634f8c91b36be3194cedb"
    app "CodeFlare-darwin-x64/CodeFlare.app"
  else
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-arm64.tar.bz2"
    sha256 "6d0801da4f2fe12f126b650c41e9dfef633dfe651a4f57a9804f3ce5f15e1e22"
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
