cask "codeflare" do
  version "0.0.3"

  name "CodeFlare"
  desc "CLI for Project CodeFlare"
  homepage "https://github.com/project-codeflare"

  if Hardware::CPU.intel?
    url "https://github.com/guidebooks/CodeFlareApp/releases/download/v#{version}/CodeFlare-darwin-x64.tar.bz2"
    sha256 "e9a15190392f51973f59a0325f49a70724ddb07c89e073f8317eb1d390f6c781"
    app "CodeFlare-darwin-x64/CodeFlare.app"
  else
    url "https://github.com/guidebooks/CodeFlareApp/releases/download/v#{version}/CodeFlare-darwin-amd64.tar.bz2"
    sha256 "2c1cd39a261bfe67ef9bb25bcc825abd3b20b0d16046f02879fea074a38d6e62"
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
