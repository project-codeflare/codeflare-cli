/*
 * Copyright 2022 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MenuItemConstructorOptions } from "electron"
import { CreateWindowFunction } from "@kui-shell/core"
import { UpdateFunction } from "@kui-shell/plugin-madwizard/watch"

import codeflare from "./codeflare"

/** @return menu items that open dashboards for the given `profile` */
export default async function dashboards(
  profile: string,
  createWindow: CreateWindowFunction,
  updateFn: UpdateFunction
): Promise<MenuItemConstructorOptions[]> {
  const mlflow = { name: "MLFlow", portEnv: "MLFLOW_PORT" }
  const tensorboard = { name: "Tensorboard", portEnv: "TENSORBOARD_PORT" }
  const pytorchProfiler = {
    name: "PyTorch Profiler",
    nameForGuidebook: "Tensorboard",
    portEnv: "TENSORBOARD_PORT",
    path: "#pytorch_profiler",
  }

  return [
    { label: "CodeFlare", submenu: await codeflare(profile, createWindow, updateFn) },
    { label: "MLFlow", click: () => import("./open").then((_) => _.default(mlflow, profile, createWindow)) },
    { label: "Tensorboard", click: () => import("./open").then((_) => _.default(tensorboard, profile, createWindow)) },
    {
      label: "PyTorch Profiler",
      click: () => import("./open").then((_) => _.default(pytorchProfiler, profile, createWindow)),
    },
  ]
}
