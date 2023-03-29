# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree.

import sys # @starpit 20230312
print(sys.argv[1:]) # @starpit 20230312

"""
Compute World Size Example
============================

This is a minimal "hello world" style  example application that uses
PyTorch Distributed to compute the world size. It does not do ML training
but it does initialize process groups and performs a single collective operation (all_reduce)
which is enough to validate the infrastructure and scheduler setup.

As simple as this application is, the actual ``compute_world_size()`` function is
split into a separate submodule (``.module.util.compute_world_size``) to double
as a E2E test for workspace patching logic, which typically diff-patches a full project
directory rather than a single file. This application also uses `Hydra <https://hydra.cc/docs/intro/>`_
configs as an expository example of how to use Hydra configs in an application that launches with TorchX.

Run it with the ``dist.ddp`` builtin component to use as a validation application
to ensure that the stack has been setup properly for more serious distributed training jobs.
"""

from torch.distributed.elastic.multiprocessing.errors import record
from module.util import compute_world_size


@record
def run() -> None:
    compute_world_size()


if __name__ == "__main__":
    run()

    print("Succeeded") # @starpit 20230312,20230329 for testing
