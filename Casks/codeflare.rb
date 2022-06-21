cask "codeflare" do
  version "0.0.24"

  name "CodeFlare"
  desc "CLI for Project CodeFlare"
  homepage "https://github.com/project-codeflare/codeflare-cli"

  if Hardware::CPU.intel?
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-x64.tar.bz2"
    sha256 "12da5c6eaff1dee75a67b44f51a08ef8fd677f62d91e56d5c418b2f902b85662"
    app "CodeFlare-darwin-x64/CodeFlare.app"
  else
    url "https://github.com/project-codeflare/codeflare-cli/releases/download/v#{version}/CodeFlare-darwin-arm64.tar.bz2"
    sha256 "ec3e27a59bc238e4149c2f35127a9ba154e0fedc6500f315f9a98db5d5bada20"
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
