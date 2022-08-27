CLUSTER=codeflare-test

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOT=${ROOT-"$SCRIPTDIR"/../../}
NODE=$(which node)
CODEFLARE_HEADLESS_HOME=${CODEFLARE_HEADLESS_HOME-"$ROOT"/dist/headless}
export MWPROFILES_PATH_BASE="$SCRIPTDIR"/profiles
