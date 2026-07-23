import {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  assertPrivateIdentityForTest,
  assertFilesystemCapabilitiesForTest,
  captureDirectoryIdentity,
  captureFileIdentity,
  createExclusiveFileIdentity,
  FilesystemIdentityLease,
} from "../src/filesystem-identity.js";

const repositoryRoot = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const testRoot = path.join(
  repositoryRoot,
  "results/runs/m4-profile-controls/m4-filesystem-identity-test",
);

async function resetTestRoot(): Promise<void> {
  await rm(testRoot, { recursive: true, force: true });
  await mkdir(testRoot, { mode: 0o700 });
  await chmod(testRoot, 0o700);
}

beforeEach(resetTestRoot);
afterEach(async () => await rm(testRoot, { recursive: true, force: true }));

describe("private BigInt filesystem identity", () => {
  it("binds the dormant activation objects to distinct peer identities", async () => {
    const sourceRoot = path.join(
      repositoryRoot,
      "containers/profile-control/src",
    );
    const compiledRoot = path.join(
      repositoryRoot,
      "containers/profile-control/dist",
    );
    const sourceName = "frozen-research-profile-control-entry.ts";
    const javascriptName = "frozen-research-profile-control-entry.js";
    const declarationName = "frozen-research-profile-control-entry.d.ts";
    const sourcePeerName = "orchestrator-entry.ts";
    const javascriptPeerName = "orchestrator-entry.js";
    const declarationPeerName = "orchestrator-entry.d.ts";
    const sourceBytes = await readFile(path.join(sourceRoot, sourceName));
    const javascriptBytes = await readFile(
      path.join(compiledRoot, javascriptName),
    );
    const declarationBytes = await readFile(
      path.join(compiledRoot, declarationName),
    );
    const sourcePeerBytes = await readFile(
      path.join(sourceRoot, sourcePeerName),
    );
    const javascriptPeerBytes = await readFile(
      path.join(compiledRoot, javascriptPeerName),
    );
    const declarationPeerBytes = await readFile(
      path.join(compiledRoot, declarationPeerName),
    );
    const sourcePeerStat = await lstat(path.join(sourceRoot, sourcePeerName), {
      bigint: true,
    });
    const javascriptPeerStat = await lstat(
      path.join(compiledRoot, javascriptPeerName),
      { bigint: true },
    );
    const declarationPeerStat = await lstat(
      path.join(compiledRoot, declarationPeerName),
      { bigint: true },
    );
    const exactMode = (mode: bigint): number => Number(mode & 0o7777n);
    const sourceDirectory = await captureDirectoryIdentity(
      "activation-source-parent",
      sourceRoot,
      {
        mode: "captured",
        children: await readdir(sourceRoot),
      },
    );
    const compiledDirectory = await captureDirectoryIdentity(
      "activation-compiled-parent",
      compiledRoot,
      {
        mode: "captured",
        children: await readdir(compiledRoot),
      },
    );
    const sourcePeer = await captureFileIdentity(
      "activation-source-peer",
      path.join(sourceRoot, sourcePeerName),
      {
        mode: exactMode(sourcePeerStat.mode),
        maximumBytes: sourcePeerBytes.byteLength,
        exactSize: BigInt(sourcePeerBytes.byteLength),
        content: "read",
        expectedBytes: sourcePeerBytes,
      },
    );
    const javascriptPeer = await captureFileIdentity(
      "activation-javascript-peer",
      path.join(compiledRoot, javascriptPeerName),
      {
        mode: exactMode(javascriptPeerStat.mode),
        maximumBytes: javascriptPeerBytes.byteLength,
        exactSize: BigInt(javascriptPeerBytes.byteLength),
        content: "read",
        expectedBytes: javascriptPeerBytes,
      },
    );
    const declarationPeer = await captureFileIdentity(
      "activation-declaration-peer",
      path.join(compiledRoot, declarationPeerName),
      {
        mode: exactMode(declarationPeerStat.mode),
        maximumBytes: declarationPeerBytes.byteLength,
        exactSize: BigInt(declarationPeerBytes.byteLength),
        content: "read",
        expectedBytes: declarationPeerBytes,
      },
    );
    const source = await captureFileIdentity(
      "activation-source",
      path.join(sourceRoot, sourceName),
      {
        mode: exactMode(sourcePeerStat.mode),
        owner: sourcePeer.owner(),
        maximumBytes: 774,
        exactSize: 774n,
        content: "read",
        expectedBytes: sourceBytes,
      },
    );
    const javascript = await captureFileIdentity(
      "activation-javascript",
      path.join(compiledRoot, javascriptName),
      {
        mode: exactMode(javascriptPeerStat.mode),
        owner: javascriptPeer.owner(),
        maximumBytes: 788,
        exactSize: 788n,
        content: "read",
        expectedBytes: javascriptBytes,
      },
    );
    const declaration = await captureFileIdentity(
      "activation-declaration",
      path.join(compiledRoot, declarationName),
      {
        mode: exactMode(declarationPeerStat.mode),
        owner: declarationPeer.owner(),
        maximumBytes: 11,
        exactSize: 11n,
        content: "read",
        expectedBytes: declarationBytes,
      },
    );
    const lease = new FilesystemIdentityLease([
      {
        object: sourceDirectory,
        expectations: {
          mode: "captured",
          children: await readdir(sourceRoot),
        },
      },
      {
        object: compiledDirectory,
        expectations: {
          mode: "captured",
          children: await readdir(compiledRoot),
        },
      },
      {
        object: sourcePeer,
        expectations: {
          mode: exactMode(sourcePeerStat.mode),
          maximumBytes: sourcePeerBytes.byteLength,
          exactSize: BigInt(sourcePeerBytes.byteLength),
          content: "read",
          expectedBytes: sourcePeerBytes,
        },
      },
      {
        object: javascriptPeer,
        expectations: {
          mode: exactMode(javascriptPeerStat.mode),
          maximumBytes: javascriptPeerBytes.byteLength,
          exactSize: BigInt(javascriptPeerBytes.byteLength),
          content: "read",
          expectedBytes: javascriptPeerBytes,
        },
      },
      {
        object: declarationPeer,
        expectations: {
          mode: exactMode(declarationPeerStat.mode),
          maximumBytes: declarationPeerBytes.byteLength,
          exactSize: BigInt(declarationPeerBytes.byteLength),
          content: "read",
          expectedBytes: declarationPeerBytes,
        },
      },
      {
        object: source,
        expectations: {
          mode: exactMode(sourcePeerStat.mode),
          owner: sourcePeer.owner(),
          maximumBytes: 774,
          exactSize: 774n,
          content: "read",
          expectedBytes: sourceBytes,
        },
      },
      {
        object: javascript,
        expectations: {
          mode: exactMode(javascriptPeerStat.mode),
          owner: javascriptPeer.owner(),
          maximumBytes: 788,
          exactSize: 788n,
          content: "read",
          expectedBytes: javascriptBytes,
        },
      },
      {
        object: declaration,
        expectations: {
          mode: exactMode(declarationPeerStat.mode),
          owner: declarationPeer.owner(),
          maximumBytes: 11,
          exactSize: 11n,
          content: "read",
          expectedBytes: declarationBytes,
        },
      },
    ]);
    await lease.validate();
    await lease.validate();
    await lease.close();
  });

  it("rejects numeric and unavailable private identity fields", () => {
    const exact = {
      device: 1n,
      inode: 2n,
      uid: 3n,
      gid: 4n,
      mode: 0o100600n,
      nlink: 1n,
      size: 0n,
      mtimeNs: 5n,
      ctimeNs: 6n,
    };
    expect(() => assertPrivateIdentityForTest(exact)).not.toThrow();
    for (const key of Object.keys(exact) as (keyof typeof exact)[]) {
      expect(() =>
        assertPrivateIdentityForTest({ ...exact, [key]: Number(exact[key]) }),
      ).toThrow("M4_IDENTITY_UNSUPPORTED");
    }
    expect(() =>
      assertPrivateIdentityForTest({ ...exact, uid: undefined }),
    ).toThrow("M4_IDENTITY_UNSUPPORTED");
  });

  it("rejects owner substitution without publishing numeric ownership", async () => {
    const target = path.join(testRoot, "owner.txt");
    await writeFile(target, "owner\n", { mode: 0o600 });
    const root = await captureDirectoryIdentity("test-root", testRoot, {
      mode: 0o700,
      children: ["owner.txt"],
    });
    const owner = root.owner();
    await expect(
      captureFileIdentity("owner-file", target, {
        mode: 0o600,
        owner: { uid: owner.uid + 1n, gid: owner.gid },
        maximumBytes: 6,
        content: "read",
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await root.close();
  });

  it("rejects fixed CLI metadata-only state with a different run owner", async () => {
    const target = path.join(testRoot, ".token_seed");
    await writeFile(target, Buffer.alloc(74), { mode: 0o600 });
    const root = await captureDirectoryIdentity(
      "fixed-cli-run-root",
      testRoot,
      {
        mode: 0o700,
        children: [".token_seed"],
      },
    );
    const owner = root.owner();
    await expect(
      captureFileIdentity("fresh-config:docker-config/.token_seed", target, {
        mode: 0o600,
        owner: { uid: owner.uid, gid: owner.gid + 1n },
        exactSize: 74n,
        content: "metadata-only",
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await root.close();
  });

  it("rejects symlink and hard-link aliases", async () => {
    const target = path.join(testRoot, "source.txt");
    await writeFile(target, "alias\n", { mode: 0o600 });
    await link(target, path.join(testRoot, "hardlink.txt"));
    await expect(
      captureFileIdentity("hard-linked", target, {
        mode: 0o600,
        maximumBytes: 6,
        content: "read",
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await symlink("source.txt", path.join(testRoot, "symlink.txt"));
    await expect(
      captureFileIdentity("symlink", path.join(testRoot, "symlink.txt"), {
        mode: 0o600,
        maximumBytes: 6,
        content: "read",
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
  });

  it("rejects special-bit, same-size replacement, and in-place drift", async () => {
    const special = path.join(testRoot, "special.txt");
    await writeFile(special, "mode\n", { mode: 0o600 });
    await chmod(special, 0o4600);
    await expect(
      captureFileIdentity("special-bit", special, {
        mode: 0o600,
        maximumBytes: 5,
        content: "read",
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");

    const replacement = path.join(testRoot, "replacement.txt");
    await writeFile(replacement, "same\n", { mode: 0o600 });
    const heldReplacement = await captureFileIdentity(
      "same-size-replacement",
      replacement,
      { mode: 0o600, maximumBytes: 5, content: "read" },
    );
    await rename(replacement, path.join(testRoot, "old-replacement.txt"));
    await writeFile(replacement, "same\n", { mode: 0o600 });
    await expect(
      heldReplacement.validateStable({
        mode: 0o600,
        maximumBytes: 5,
        content: "read",
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await heldReplacement.close();

    const mutable = path.join(testRoot, "mutable.txt");
    await writeFile(mutable, "first\n", { mode: 0o600 });
    const heldMutable = await captureFileIdentity("in-place", mutable, {
      mode: 0o600,
      maximumBytes: 6,
      content: "read",
    });
    await writeFile(mutable, "other\n");
    await expect(
      heldMutable.validateStable({
        mode: 0o600,
        maximumBytes: 6,
        content: "read",
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await heldMutable.close();
  });

  it("rejects parent replacement and use after descriptor close", async () => {
    const parent = path.join(testRoot, "parent");
    const backup = path.join(testRoot, "parent-backup");
    await mkdir(parent, { mode: 0o700 });
    await writeFile(path.join(parent, "input.txt"), "input\n", { mode: 0o600 });
    const heldParent = await captureDirectoryIdentity("parent", parent, {
      mode: 0o700,
      children: ["input.txt"],
    });
    await rename(parent, backup);
    await mkdir(parent, { mode: 0o700 });
    await writeFile(path.join(parent, "input.txt"), "input\n", { mode: 0o600 });
    await expect(
      heldParent.validateStable({ mode: 0o700, children: ["input.txt"] }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await heldParent.close();
    await expect(
      heldParent.validateStable({ mode: 0o700, children: ["input.txt"] }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
  });

  it("rejects replacement of a nested held source ancestor", async () => {
    const outer = path.join(testRoot, "outer");
    const fixture = path.join(outer, "fixture");
    await mkdir(fixture, { recursive: true, mode: 0o700 });
    await writeFile(path.join(fixture, "input.txt"), "input\n", {
      mode: 0o600,
    });
    const rootExpectations = { mode: 0o700, children: ["outer"] } as const;
    const outerExpectations = {
      mode: 0o700,
      children: ["fixture"],
    } as const;
    const fixtureExpectations = {
      mode: 0o700,
      children: ["input.txt"],
    } as const;
    const root = await captureDirectoryIdentity(
      "nested-root",
      testRoot,
      rootExpectations,
    );
    const heldOuter = await captureDirectoryIdentity(
      "nested-outer",
      outer,
      outerExpectations,
    );
    const heldFixture = await captureDirectoryIdentity(
      "nested-fixture",
      fixture,
      fixtureExpectations,
    );
    const lease = new FilesystemIdentityLease([
      { object: root, expectations: rootExpectations },
      { object: heldOuter, expectations: outerExpectations },
      { object: heldFixture, expectations: fixtureExpectations },
    ]);
    await rename(outer, path.join(testRoot, "outer-backup"));
    await mkdir(path.join(testRoot, "outer", "fixture"), {
      recursive: true,
      mode: 0o700,
    });
    await writeFile(
      path.join(testRoot, "outer", "fixture", "input.txt"),
      "input\n",
      {
        mode: 0o600,
      },
    );
    await expect(lease.validate()).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await lease.close();
  });

  it("retains the original creating descriptor through read-back and settlement", async () => {
    const parent = await captureDirectoryIdentity(
      "creating-descriptor-parent",
      testRoot,
      { mode: 0o700, children: [] },
    );
    const bytes = new TextEncoder().encode("created\n");
    const created = await createExclusiveFileIdentity({
      logicalRole: "creating-descriptor-file",
      parent,
      name: "created.txt",
      mode: 0o600,
      bytes,
      expectedParentChildren: ["created.txt"],
    });
    await expect(
      created.assertCreatingDescriptorContinuityForTest(),
    ).resolves.toBeUndefined();
    await rename(
      path.join(testRoot, "created.txt"),
      path.join(testRoot, "created-original.txt"),
    );
    await writeFile(path.join(testRoot, "created.txt"), bytes, { mode: 0o600 });
    expect(await created.readBytes(bytes.byteLength)).toEqual(bytes);
    await expect(
      created.validateStable({
        mode: 0o600,
        maximumBytes: bytes.byteLength,
        exactSize: BigInt(bytes.byteLength),
        content: "read",
        expectedBytes: bytes,
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await created.close();
    await parent.close();
  });

  it("preserves a creating-descriptor sync failure and reports close failure", async () => {
    const parent = await captureDirectoryIdentity(
      "sync-failure-parent",
      testRoot,
      { mode: 0o700, children: [] },
    );
    const probe = await open(testRoot, "r");
    const prototype = Object.getPrototypeOf(probe) as {
      close(): Promise<void>;
      sync(): Promise<void>;
    };
    await probe.close();
    const syncSpy = vi
      .spyOn(prototype, "sync")
      .mockRejectedValueOnce(new Error("synthetic sync failure"));
    await expect(
      createExclusiveFileIdentity({
        logicalRole: "sync-failure-file",
        parent,
        name: "sync-failure.txt",
        mode: 0o600,
        bytes: new TextEncoder().encode("failure\n"),
        expectedParentChildren: ["sync-failure.txt"],
      }),
    ).rejects.toThrow("synthetic sync failure");
    syncSpy.mockRestore();
    await parent.close();

    await resetTestRoot();
    const closeParent = await captureDirectoryIdentity(
      "close-failure-parent",
      testRoot,
      { mode: 0o700, children: [] },
    );
    const created = await createExclusiveFileIdentity({
      logicalRole: "close-failure-file",
      parent: closeParent,
      name: "close-failure.txt",
      mode: 0o600,
      bytes: new TextEncoder().encode("failure\n"),
      expectedParentChildren: ["close-failure.txt"],
    });
    const internalHandle = (
      created as unknown as {
        handle: { close(): Promise<void> };
      }
    ).handle;
    const originalClose = internalHandle.close.bind(internalHandle);
    const closeSpy = vi
      .spyOn(internalHandle, "close")
      .mockImplementationOnce(async () => {
        await originalClose();
        throw new Error("synthetic close failure");
      });
    await expect(created.close()).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    closeSpy.mockRestore();
    await closeParent.close();
  });

  it("rejects unavailable no-follow and directory-open capabilities", () => {
    expect(() =>
      assertFilesystemCapabilitiesForTest({
        noFollow: 0,
        directory: 1,
        kind: "regular-file",
      }),
    ).toThrow("M4_IDENTITY_UNSUPPORTED");
    expect(() =>
      assertFilesystemCapabilitiesForTest({
        noFollow: 1,
        directory: undefined,
        kind: "directory",
      }),
    ).toThrow("M4_IDENTITY_UNSUPPORTED");
  });

  it("forbids runtime-state content reads and existing-destination overwrite", async () => {
    const metadataPath = path.join(testRoot, "metadata-only");
    await writeFile(metadataPath, Buffer.alloc(4), { mode: 0o600 });
    const metadataOnly = await captureFileIdentity(
      "runtime-state-metadata",
      metadataPath,
      {
        mode: 0o600,
        exactSize: 4n,
        content: "metadata-only",
      },
    );
    await expect(metadataOnly.readBytes(4)).rejects.toThrow(
      "M4_IDENTITY_UNSUPPORTED",
    );
    await metadataOnly.close();

    const parent = await captureDirectoryIdentity(
      "exclusive-parent",
      testRoot,
      {
        mode: 0o700,
        children: ["metadata-only"],
      },
    );
    await expect(
      createExclusiveFileIdentity({
        logicalRole: "overwrite-attempt",
        parent,
        name: "metadata-only",
        mode: 0o600,
        bytes: new TextEncoder().encode("new\n"),
        expectedParentChildren: ["metadata-only"],
      }),
    ).rejects.toThrow("M4_IDENTITY_UNSUPPORTED");
    await parent.close();
  });
});
