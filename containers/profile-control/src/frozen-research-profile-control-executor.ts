import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants, type BigIntStats } from "node:fs";
import {
  lstat,
  open,
  readdir,
  realpath,
  type FileHandle,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const EXPECTED_REVISION = "m4-activation-expected-20260720-02";
const PERMISSIVE_RUN_ID = "m4-profile-control-p-20260720-02";
const CONSTRAINED_RUN_ID = "m4-profile-control-c-20260720-02";
const CONTROL_IMAGE_DIGEST =
  "sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd";
const ACTIVATION_SOURCE_BYTES = 774;
const ACTIVATION_SOURCE_SHA256 =
  "580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d";
const ACTIVATION_EXECUTABLE_BYTES = 788;
const ACTIVATION_EXECUTABLE_SHA256 =
  "34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7";
const OUTPUT_LIMIT = 65_536;
const TIMEOUT_MS = 90_000;
const SIGNAL_GRACE_MS = 1_000;
const encoder = new TextEncoder();
const fatalDecoder = new TextDecoder("utf-8", { fatal: true });

const ROOT_INVENTORY = Object.freeze([
  ".codex",
  ".git",
  ".gitignore",
  ".npmrc",
  ".prettierignore",
  ".prettierrc.json",
  ".tmp",
  "AGENTS.md",
  "README.md",
  "containers",
  "docs",
  "eslint.config.js",
  "experiments",
  "fixtures",
  "node_modules",
  "package-lock.json",
  "package.json",
  "packages",
  "profiles",
  "prompts",
  "results",
  "scenarios",
  "scripts",
  "tests",
  "tsconfig.base.json",
  "tsconfig.json",
  "vitest.config.ts",
]);
const CONTAINERS_INVENTORY = Object.freeze([
  "AGENTS.md",
  "README.md",
  "constrained",
  "permissive",
  "presentation-profiles",
  "profile-control",
]);
const CONTROL_INVENTORY = Object.freeze([
  "Containerfile",
  "README.md",
  "dist",
  "fixture",
  "image-input.json",
  "node_modules",
  "scripts",
  "src",
  "test",
  "tsconfig.build.json",
  "tsconfig.json",
  "vitest.config.ts",
]);
const SOURCE_INVENTORY = Object.freeze([
  "canonical.ts",
  "completion.ts",
  "constants.ts",
  "control-host-backend.ts",
  "definitions.ts",
  "docker-formats.ts",
  "docker-plan.ts",
  "doctor-host-backend.ts",
  "doctor.ts",
  "errors.ts",
  "evidence.ts",
  "execution.ts",
  "filesystem-identity.ts",
  "frozen-research-profile-control-entry.ts",
  "frozen-research-profile-control-executor.ts",
  "image-input.ts",
  "index.ts",
  "inspect.ts",
  "offline-build-host-backend.ts",
  "offline-build-process.ts",
  "offline-build-recovery-entry.ts",
  "offline-build-recovery-host-backend.ts",
  "offline-build-recovery.ts",
  "offline-build.ts",
  "orchestrator-entry.ts",
  "orchestrator.ts",
  "profile-input.ts",
  "run-controls.ts",
  "safe-data.ts",
  "staging.ts",
  "types.ts",
  "validation.ts",
]);
const COMPILED_INVENTORY = Object.freeze(
  SOURCE_INVENTORY.flatMap((name) => {
    const basename = name.slice(0, -3);
    return [`${basename}.d.ts`, `${basename}.js`];
  }).sort(),
);
const PROFILES_INVENTORY = Object.freeze(["constrained", "permissive"]);
const PROFILE_INVENTORY = Object.freeze(["README.md", "profile.json"]);

type ConstructionRow = readonly [
  name: string,
  sourceBytes: number,
  sourceHash: string,
  javascriptBytes: number,
  javascriptHash: string,
  declarationBytes: number,
  declarationHash: string,
];

const ACTIVATION_ROWS: readonly ConstructionRow[] = Object.freeze([
  [
    "canonical",
    2203,
    "4f635c6bb7ac6cbc6a9c3488028277e7eddac37061b80c4b848524dad0ba8699",
    2009,
    "bbe3f25a2a11177c393dbcb272258ebdd097fba230850c9a5a8c4679c33b3a62",
    462,
    "c05481f834670411ca5bfe04ba1fabc028e4f06f80b23b7f1bd120777b0ccc93",
  ],
  [
    "completion",
    6655,
    "73e94cd1b65ae068ce742219a7e9e903c8a2564ea1193ad265ac90d4a98c6840",
    5946,
    "a8dcd3f5cc088de86e190e9d5ed6062eb8f9c030e3ebafb2a873150d3091d771",
    892,
    "a31f726ee15aba4ab13e91641b413d374365c602adf890ae9bb87815beb1c8d0",
  ],
  [
    "constants",
    4635,
    "60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65",
    4298,
    "2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb",
    4628,
    "d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651",
  ],
  [
    "control-host-backend",
    39867,
    "a37baa7dd651a1346c9f38b6116a38a7ddc0c4e33f83f4ceae3d804c6bfd646f",
    37690,
    "e4685e4fda539e35ef3bdfb984191fd6fbefc4ee3bab9fffc41635e610a51125",
    942,
    "6c47c9ab43b57ad1ff673f6f4e4dead732408f458fa2afbcf08cb647a0ebef1f",
  ],
  [
    "definitions",
    7776,
    "e20c0bf8135d0db349a50525154181bc5c4b1cb2282b2f7933cabdb0c779d38e",
    7451,
    "00eb73c608968cbcf15c5ae0c9fad62aca44a6390411cadc89f0ae1762029def",
    916,
    "461df2c274834f3406868d544069814a65555d55f81a8e1ed8573e9698928c2c",
  ],
  [
    "docker-formats",
    2519,
    "6f24020cdd1a54b9fa8abfbee665babf99fc3a0a0240f7892b5b924f7c945725",
    2462,
    "d4fe03deb175079f4b9b8c115833334e4ce33681cb41d918ec271a4f06f375b6",
    4559,
    "2875745d66b306a09954cd8277f73c5b8ddc6bfe8a13328c5f940e32f6a49d1b",
  ],
  [
    "docker-plan",
    13008,
    "5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1",
    10813,
    "030bc5d603ddebf3320fb3212d45ee1320af1a0c126252566cbea3abb727ab13",
    3313,
    "5f4a2edcc08d2577610dd080ee78b1481760938adf523dffcafb1a330acfc42a",
  ],
  [
    "errors",
    369,
    "d4e96236380e93154e8c9e1cb70680bb731fb67e28fbe9c0ba37594ca38de709",
    260,
    "d6759eb698e8a06bebbf30ea2ec36fc9881dcd3a23af5bef4ba034e4f82a177a",
    261,
    "23adfef21df4ed57fb15ba36f9ed09289cf3c75c00f3b97ab86612f46b574b52",
  ],
  [
    "evidence",
    5741,
    "2d562c1f988b2592d897af5f94d77d417f3c3e3e723ae8257ac9eda7600a7a96",
    5419,
    "be6e8bca77e54691b5619495a6f636634ceed05923f2ce0a72c84dc6ca146586",
    391,
    "ece686d251e68a63e740d31b7ed9e20664c1bc63764f7d852c3c2027a30cf4bf",
  ],
  [
    "execution",
    20725,
    "4e893140d85351c45b1ac96afca89d95830fd3862c322a464731b7d087ebabde",
    17918,
    "3e178ab0293e575b0755f70274eba4248109f19a48b6781b1af6a7c4bf8354ac",
    2364,
    "dc85a74e27a8108f0946326bcec4e9a19f46d13e4819159d72e59e0025b167b9",
  ],
  [
    "filesystem-identity",
    25227,
    "1dad4648451daaf3681a1eb07a196f6c361513e75f63a0eff94ebe665a67abf1",
    22909,
    "a6692c54e71a4d3b54ed8f29f66b40cdc2a1eb8fc1d5f1660fe5c439c4453385",
    4644,
    "a987a326d7659aa49dc69b60b4c744912a141e1f6c6892641e2296a9263a6daa",
  ],
  [
    "frozen-research-profile-control-entry",
    774,
    "580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d",
    788,
    "34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7",
    11,
    "8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881",
  ],
  [
    "image-input",
    3117,
    "3d62d6842d7b0aafde8cc42a647c31235860411a9c77acaaae8e60b4de7fe16c",
    2946,
    "280fc04ba2dd7900755b335a2f599791adb52012b65adbc499fbd92caf949380",
    319,
    "47eef11d826490aa6fb7d472ab25efc0edaf847346f9a046688ea2c650b28432",
  ],
  [
    "inspect",
    8888,
    "9c24c147ba5d2ef03606c9be3af1d9e7cdcd6aa14de6259960e14c6310b5c1d8",
    8403,
    "a1304f9668c421c55f861f65486cb3a006aac870c0810cb648ed04dc5f15733e",
    466,
    "7476ad3237a5e95d816b26ce5a5efed40c08c6c88118c670bba35418911f3f07",
  ],
  [
    "offline-build-process",
    1780,
    "e32177d3c8f1f6be31f37572aeaf8abf12da961527cb1a830dd2121d1c08639c",
    1345,
    "a0cf7c8d936ea96e328c1cd57b9cba315c9c2e9ac00144aeb15202198229d8ba",
    694,
    "ff8a0df29777071b3e50750bd1c5383536b9dbc752f49168cb57fa56f9e181d2",
  ],
  [
    "orchestrator",
    755,
    "fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6",
    547,
    "a71204ff47db0c548f107af2714b270249b4109a570333d1a8478bfb421a6c6d",
    379,
    "e707246ff2068215121040d0544aef3fa75ff581447fb47e0e4ee31eac43e25c",
  ],
  [
    "profile-input",
    1873,
    "a2d799a8d86bc82d4c64e767ffb289277ed9c391293711f69a0bd5ec53df2844",
    1714,
    "5471dab87a02f809263bc570d8362b52d19c579ef526eec59e5e725b4a7da50b",
    318,
    "5429cb52fe983239d214e1d50748622f40748953661f24efed9f7d75775f96ad",
  ],
  [
    "run-controls",
    7924,
    "25a0fd3b204594271970ddbd7d644ee2c12d5dbd31ad9a906150f293e3f4f550",
    7457,
    "e53ec9ecf25c020a138aecd3ca4e5c1b6363e553591f1056c118daf88eeb020d",
    441,
    "e027528b9396bcf5cfd790bfee355c67cb35c3292595c512cd0d18efc66d3408",
  ],
  [
    "safe-data",
    4208,
    "9f2816f356907c3280cc7fd3c20f3d4eb3e97f5db1dc1ddca0d10a70daef0c88",
    3860,
    "7ad600291ce3da4b7cc884e48e1c8ac7bb5ee2d13cd738df7ff8d6240271bdd5",
    934,
    "1f4a5978637337d07b9ea79da6a9b7c1db69a8b09ba16f68e90c978a5b5cf0bd",
  ],
  [
    "staging",
    7695,
    "795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5",
    6973,
    "823efef60cdf17799755c0c589d13cbba1c74f688e368fa865670ae6e85350a0",
    1028,
    "5c218a4ec00455c7a5fa412ca28d5b56f42df642ab78700175b267de0ec33d04",
  ],
  [
    "types",
    9581,
    "9bed7d4a65033d9b120666c6c2848f03e75cf2a7ca9d4f1fb6f9f59050d4d3c3",
    11,
    "8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881",
    9768,
    "e5485ee736d5b42ad81258a2f8e7a8dfb75d27d3ae2ec1ee757108142adc13cd",
  ],
  [
    "validation",
    14486,
    "5e8952f317b1a2b9555968df54c02a784ce581c1762b774ec677eb8139eb3404",
    13563,
    "25b24fd56adb78af26dc3ff490d5f6d9e4a4b53b962dc04e0a18ef3b7b3fd52f",
    457,
    "1d34988ade527f386a35b854db608959f5dd6de3d6d09ac4d975089c6d035d8a",
  ],
]);

type WrapperFailure =
  | "ACTIVATION_TIMEOUT"
  | "ACTIVATION_OUTPUT_LIMIT"
  | "ACTIVATION_PROCESS_FAILURE"
  | "CONTROL_RESULT_INVALID";
type PublicFailure = WrapperFailure | "CONTROL_INCONCLUSIVE";
type ExitTuple = Readonly<{ code: number | null; signal: string | null }>;

interface IdentitySnapshot {
  readonly dev: bigint;
  readonly ino: bigint;
  readonly uid: bigint;
  readonly gid: bigint;
  readonly mode: bigint;
  readonly nlink: bigint;
  readonly size: bigint;
  readonly mtimeNs: bigint;
  readonly ctimeNs: bigint;
}

interface HeldObject {
  readonly role: string;
  readonly target: string;
  readonly handle: FileHandle;
  readonly identity: IdentitySnapshot;
  readonly directory: boolean;
  readonly inventory: readonly string[] | null;
  readonly byteLength: number | null;
  readonly sha256: string | null;
  closed: boolean;
}

export interface ExecutorIdentityLeaseForTest {
  validate(): Promise<void>;
  close(): Promise<void>;
}

export interface ExecutorChildForTest {
  readonly pid?: number;
  readonly stdout: ExecutorStreamForTest | null;
  readonly stderr: ExecutorStreamForTest | null;
  on(event: string, listener: (...args: unknown[]) => void): unknown;
}

export interface ExecutorStreamForTest {
  on(event: "data", listener: (chunk: Uint8Array) => void): unknown;
}

export interface ExecutorBoundariesForTest {
  spawnChild(): ExecutorChildForTest;
  signalGroup(pid: number, signal: "SIGTERM" | "SIGKILL"): boolean;
  schedule(callback: () => void, milliseconds: number): unknown;
  cancel(handle: unknown): void;
  writeStdout(bytes: Uint8Array): void;
  writeStderr(bytes: Uint8Array): void;
  setExitCode(code: number): void;
}

function fail(): never {
  throw new Error("M4_ACTIVATION_INVALID");
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactArray(
  actual: readonly string[],
  expected: readonly string[],
): void {
  if (
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    fail();
  }
}

function snapshot(stat: BigIntStats): IdentitySnapshot {
  return Object.freeze({
    dev: stat.dev,
    ino: stat.ino,
    uid: stat.uid,
    gid: stat.gid,
    mode: stat.mode,
    nlink: stat.nlink,
    size: stat.size,
    mtimeNs: stat.mtimeNs,
    ctimeNs: stat.ctimeNs,
  });
}

function sameIdentity(
  left: IdentitySnapshot,
  right: IdentitySnapshot,
): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.uid === right.uid &&
    left.gid === right.gid &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs
  );
}

function exactType(identity: IdentitySnapshot, directory: boolean): void {
  const kind = identity.mode & BigInt(constants.S_IFMT);
  const expected = BigInt(directory ? constants.S_IFDIR : constants.S_IFREG);
  if (
    kind !== expected ||
    identity.nlink < 1n ||
    (!directory && identity.nlink !== 1n) ||
    identity.mode !== BigInt(directory ? 0o40775 : 0o100664)
  ) {
    fail();
  }
}

async function readHeldBytes(
  handle: FileHandle,
  expectedLength: number,
): Promise<Uint8Array> {
  const bytes = new Uint8Array(expectedLength);
  let offset = 0;
  while (offset < bytes.byteLength) {
    const result = await handle.read(
      bytes,
      offset,
      bytes.byteLength - offset,
      offset,
    );
    if (result.bytesRead <= 0) fail();
    offset += result.bytesRead;
  }
  const extra = new Uint8Array(1);
  if ((await handle.read(extra, 0, 1, expectedLength)).bytesRead !== 0) fail();
  return bytes;
}

async function captureDirectory(
  role: string,
  target: string,
  expectedInventory: readonly string[],
): Promise<HeldObject> {
  if ((await realpath(target)) !== target) fail();
  const before = snapshot(await lstat(target, { bigint: true }));
  exactType(before, true);
  const handle = await open(
    target,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_DIRECTORY,
  );
  try {
    const held = snapshot(await handle.stat({ bigint: true }));
    const inventory = (await readdir(target)).sort();
    const after = snapshot(await lstat(target, { bigint: true }));
    exactType(held, true);
    if (!sameIdentity(before, held) || !sameIdentity(held, after)) fail();
    exactArray(inventory, expectedInventory);
    return {
      role,
      target,
      handle,
      identity: held,
      directory: true,
      inventory: Object.freeze(inventory),
      byteLength: null,
      sha256: null,
      closed: false,
    };
  } catch (error) {
    await handle.close().catch(() => undefined);
    throw error;
  }
}

async function captureFile(
  role: string,
  target: string,
  expectedBytes?: number,
  expectedHash?: string,
  expectedPrefix?: string,
): Promise<HeldObject> {
  if ((await realpath(target)) !== target) fail();
  const before = snapshot(await lstat(target, { bigint: true }));
  exactType(before, false);
  if (before.size > BigInt(Number.MAX_SAFE_INTEGER)) fail();
  const handle = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const held = snapshot(await handle.stat({ bigint: true }));
    exactType(held, false);
    if (!sameIdentity(before, held)) fail();
    const byteLength = Number(held.size);
    const bytes = await readHeldBytes(handle, byteLength);
    const hash = sha256(bytes);
    if (
      expectedPrefix !== undefined &&
      !fatalDecoder.decode(bytes).startsWith(expectedPrefix)
    ) {
      fail();
    }
    const after = snapshot(await lstat(target, { bigint: true }));
    if (!sameIdentity(held, after)) fail();
    if (
      (expectedBytes !== undefined && byteLength !== expectedBytes) ||
      (expectedHash !== undefined && hash !== expectedHash)
    ) {
      fail();
    }
    return {
      role,
      target,
      handle,
      identity: held,
      directory: false,
      inventory: null,
      byteLength,
      sha256: hash,
      closed: false,
    };
  } catch (error) {
    await handle.close().catch(() => undefined);
    throw error;
  }
}

class ProductionIdentityLease implements ExecutorIdentityLeaseForTest {
  constructor(private readonly held: readonly HeldObject[]) {}

  async validate(): Promise<void> {
    for (const object of this.held) {
      if (object.closed || (await realpath(object.target)) !== object.target) {
        fail();
      }
      const before = snapshot(await lstat(object.target, { bigint: true }));
      const held = snapshot(await object.handle.stat({ bigint: true }));
      exactType(before, object.directory);
      if (
        !sameIdentity(object.identity, before) ||
        !sameIdentity(object.identity, held)
      ) {
        fail();
      }
      if (object.directory) {
        const inventory = (await readdir(object.target)).sort();
        exactArray(inventory, object.inventory ?? []);
      } else {
        const bytes = await readHeldBytes(
          object.handle,
          object.byteLength ?? fail(),
        );
        if (sha256(bytes) !== object.sha256) fail();
      }
      const after = snapshot(await lstat(object.target, { bigint: true }));
      if (!sameIdentity(object.identity, after)) fail();
    }
    for (let left = 0; left < this.held.length; left += 1) {
      for (let right = left + 1; right < this.held.length; right += 1) {
        const a = this.held[left]!.identity;
        const b = this.held[right]!.identity;
        if (a.dev === b.dev && a.ino === b.ino) fail();
      }
    }
  }

  async close(): Promise<void> {
    let failed = false;
    for (const object of [...this.held].reverse()) {
      if (object.closed) {
        failed = true;
        continue;
      }
      object.closed = true;
      try {
        await object.handle.close();
      } catch {
        failed = true;
      }
    }
    if (failed) fail();
  }
}

export async function captureExecutorFileIdentityForTest(
  target: string,
  expectedBytes: number,
  expectedHash: string,
): Promise<ExecutorIdentityLeaseForTest> {
  return new ProductionIdentityLease([
    await captureFile("bounded-test-file", target, expectedBytes, expectedHash),
  ]);
}

function isNodeError(error: unknown, code: string): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { readonly code?: unknown }).code === code
  );
}

async function requireAbsent(target: string): Promise<void> {
  try {
    await lstat(target, { bigint: true });
  } catch (error) {
    if (isNodeError(error, "ENOENT")) return;
    throw error;
  }
  fail();
}

function peerIdentity(left: HeldObject, right: HeldObject): void {
  if (
    left.identity.uid !== right.identity.uid ||
    left.identity.gid !== right.identity.gid ||
    left.identity.mode !== right.identity.mode ||
    (left.identity.dev === right.identity.dev &&
      left.identity.ino === right.identity.ino)
  ) {
    fail();
  }
}

async function captureProductionLease(
  repositoryRoot: string,
): Promise<ProductionIdentityLease> {
  const controlRoot = path.join(
    repositoryRoot,
    "containers",
    "profile-control",
  );
  const sourceRoot = path.join(controlRoot, "src");
  const compiledRoot = path.join(controlRoot, "dist");
  const profilesRoot = path.join(repositoryRoot, "profiles");
  const held: HeldObject[] = [];
  const hold = async (promise: Promise<HeldObject>): Promise<HeldObject> => {
    const object = await promise;
    held.push(object);
    return object;
  };
  try {
    await requireAbsent(
      path.join(
        repositoryRoot,
        "results",
        "runs",
        "m4-profile-controls",
        PERMISSIVE_RUN_ID,
      ),
    );
    await requireAbsent(
      path.join(
        repositoryRoot,
        "results",
        "runs",
        "m4-profile-controls",
        CONSTRAINED_RUN_ID,
      ),
    );
    await hold(
      captureDirectory("repository-root", repositoryRoot, ROOT_INVENTORY),
    );
    await hold(
      captureDirectory(
        "containers-root",
        path.join(repositoryRoot, "containers"),
        CONTAINERS_INVENTORY,
      ),
    );
    await hold(
      captureDirectory("profile-control-root", controlRoot, CONTROL_INVENTORY),
    );
    await hold(
      captureDirectory(
        "profile-control-source-root",
        sourceRoot,
        SOURCE_INVENTORY,
      ),
    );
    await hold(
      captureDirectory(
        "profile-control-compiled-root",
        compiledRoot,
        COMPILED_INVENTORY,
      ),
    );
    await hold(
      captureDirectory("profiles-root", profilesRoot, PROFILES_INVENTORY),
    );
    await hold(
      captureDirectory(
        "permissive-profile-root",
        path.join(profilesRoot, "permissive"),
        PROFILE_INVENTORY,
      ),
    );
    await hold(
      captureDirectory(
        "constrained-profile-root",
        path.join(profilesRoot, "constrained"),
        PROFILE_INVENTORY,
      ),
    );

    let activationSource: HeldObject | null = null;
    let activationJavascript: HeldObject | null = null;
    let activationDeclaration: HeldObject | null = null;
    let ordinarySource: HeldObject | null = null;
    let ordinaryJavascript: HeldObject | null = null;
    let ordinaryDeclaration: HeldObject | null = null;
    for (const row of ACTIVATION_ROWS) {
      const source = await hold(
        captureFile(
          `activation-source:${row[0]}`,
          path.join(sourceRoot, `${row[0]}.ts`),
          row[1],
          row[2],
        ),
      );
      const javascript = await hold(
        captureFile(
          `activation-javascript:${row[0]}`,
          path.join(compiledRoot, `${row[0]}.js`),
          row[3],
          row[4],
        ),
      );
      const declaration = await hold(
        captureFile(
          `activation-declaration:${row[0]}`,
          path.join(compiledRoot, `${row[0]}.d.ts`),
          row[5],
          row[6],
        ),
      );
      if (row[0] === "frozen-research-profile-control-entry") {
        activationSource = source;
        activationJavascript = javascript;
        activationDeclaration = declaration;
      }
      if (row[0] === "orchestrator") {
        ordinarySource = source;
        ordinaryJavascript = javascript;
        ordinaryDeclaration = declaration;
      }
    }

    const wrapperSource = await hold(
      captureFile(
        "wrapper-source",
        path.join(sourceRoot, "frozen-research-profile-control-executor.ts"),
        undefined,
        undefined,
        `import { spawn } from "node:child_process";\nimport { createHash } from "node:crypto";\nimport { constants, type BigIntStats } from "node:fs";\nimport {\n  lstat,\n  open,\n  readdir,\n  realpath,\n  type FileHandle,\n} from "node:fs/promises";\nimport path from "node:path";\nimport process from "node:process";\nimport { fileURLToPath } from "node:url";\n`,
      ),
    );
    const wrapperJavascript = await hold(
      captureFile(
        "wrapper-javascript",
        path.join(compiledRoot, "frozen-research-profile-control-executor.js"),
        undefined,
        undefined,
        `import { spawn } from "node:child_process";\nimport { createHash } from "node:crypto";\nimport { constants } from "node:fs";\nimport { lstat, open, readdir, realpath, } from "node:fs/promises";\nimport path from "node:path";\nimport process from "node:process";\nimport { fileURLToPath } from "node:url";\n`,
      ),
    );
    const wrapperDeclaration = await hold(
      captureFile(
        "wrapper-declaration",
        path.join(
          compiledRoot,
          "frozen-research-profile-control-executor.d.ts",
        ),
      ),
    );
    await hold(
      captureFile(
        "root-package",
        path.join(repositoryRoot, "package.json"),
        7_438,
        "370ffa822b913a98b56d5ef6f83e92c97cdbcd7f59d94b9a759c0a4ef5c78af1",
      ),
    );
    await hold(
      captureFile(
        "permissive-profile",
        path.join(profilesRoot, "permissive", "profile.json"),
        1_402,
        "243915063e04f4009bf2132d74ae6172a763583560ce6534c3520bbda4ddde7c",
      ),
    );
    await hold(
      captureFile(
        "constrained-profile",
        path.join(profilesRoot, "constrained", "profile.json"),
        1_411,
        "a41bc401830f4079607fb3720b1dbdf636b283fadf0db4082d0113bf3238838e",
      ),
    );
    if (
      activationSource === null ||
      activationJavascript === null ||
      activationDeclaration === null ||
      ordinarySource === null ||
      ordinaryJavascript === null ||
      ordinaryDeclaration === null
    ) {
      fail();
    }
    peerIdentity(activationSource, ordinarySource);
    peerIdentity(wrapperSource, ordinarySource);
    peerIdentity(activationJavascript, ordinaryJavascript);
    peerIdentity(wrapperJavascript, ordinaryJavascript);
    peerIdentity(activationDeclaration, ordinaryDeclaration);
    peerIdentity(wrapperDeclaration, ordinaryDeclaration);
    const repositoryOwner = held[0]?.identity ?? fail();
    if (
      held.some(
        (object) =>
          object.identity.uid !== repositoryOwner.uid ||
          object.identity.gid !== repositoryOwner.gid,
      )
    ) {
      fail();
    }
    const lease = new ProductionIdentityLease(held);
    await lease.validate();
    return lease;
  } catch (error) {
    for (const object of [...held].reverse()) {
      if (!object.closed) {
        object.closed = true;
        await object.handle.close().catch(() => undefined);
      }
    }
    throw error;
  }
}

function plainRecord(
  input: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.getPrototypeOf(input) !== Object.prototype
  ) {
    fail();
  }
  const value = input as Record<string, unknown>;
  exactArray(Object.keys(value), keys);
  return value;
}

function stringArray(input: unknown): readonly string[] {
  if (
    !Array.isArray(input) ||
    input.some((value) => typeof value !== "string")
  ) {
    fail();
  }
  return input as string[];
}

function exactPrefix(
  actual: readonly string[],
  expected: readonly string[],
): void {
  if (
    actual.length > expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    fail();
  }
}

const EXECUTION_FAILURES = Object.freeze([
  "STAGING_FAILURE",
  "COMMAND_FAILURE",
  "COMMAND_TIMEOUT",
  "OUTPUT_LIMIT",
  "INSPECTION_FAILURE",
  "TRANSFER_FAILURE",
  "IMMUTABLE_INPUT_CHANGED",
  "EVIDENCE_INVALID",
  "CLEANUP_FAILURE",
]);
const CONTROL_NAMES = Object.freeze([
  "environment-canary",
  "canary-file-read",
  "scratch-write",
  "source-mutation",
  "loopback-protocol",
  "fixed-child",
  "result-write",
]);
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function validateProfileSteps(
  input: unknown,
  profileId: string,
): readonly string[] {
  const steps = stringArray(input);
  const body = ["create", "inspect", "start", "transfer"].map(
    (step) => `${profileId}:${step}`,
  );
  const remove = `${profileId}:remove`;
  const hasRemove = steps.at(-1) === remove;
  const prefix = hasRemove ? steps.slice(0, -1) : steps;
  exactPrefix(prefix, body);
  if (!hasRemove && steps.includes(remove)) fail();
  return steps;
}

function validateComparison(
  input: unknown,
  profileId: string,
  runId: string,
): void {
  const value = plainRecord(input, [
    "runId",
    "profileId",
    "complete",
    "mismatchCount",
    "mismatches",
  ]);
  const mismatches = stringArray(value.mismatches);
  if (
    value.runId !== runId ||
    value.profileId !== profileId ||
    value.complete !== true ||
    !Number.isSafeInteger(value.mismatchCount) ||
    value.mismatchCount !== mismatches.length ||
    mismatches.some((name) => !CONTROL_NAMES.includes(name)) ||
    mismatches.some(
      (name, index) =>
        index > 0 &&
        CONTROL_NAMES.indexOf(name) <=
          CONTROL_NAMES.indexOf(mismatches[index - 1]!),
    )
  ) {
    fail();
  }
}

function validateCompletion(
  input: unknown,
  profileId: string,
  runId: string,
): void {
  const value = plainRecord(input, [
    "schemaVersion",
    "runId",
    "controlId",
    "profileId",
    "containerImageDigest",
    "hostInspectionComplete",
    "controlEvidenceComplete",
    "evidenceTransferred",
    "manifestSha256",
    "hostInspectionSha256",
    "controlEvidenceSha256",
    "inventory",
    "complete",
  ]);
  const expectedInventory =
    profileId === "permissive"
      ? [
          "input/control-manifest.json",
          "host/host-inspection.json",
          "container-result/control-evidence.json",
          "container-result/result-marker.txt",
          "scratch/scratch-marker.txt",
          "host/completion.json",
          "host/comparison.json",
        ]
      : [
          "input/control-manifest.json",
          "host/host-inspection.json",
          "container-result/control-evidence.json",
          "container-result/result-marker.txt",
          "host/completion.json",
          "host/comparison.json",
        ];
  if (
    value.schemaVersion !== "lab-profile-control-completion/v1" ||
    value.runId !== runId ||
    value.controlId !==
      (profileId === "permissive"
        ? "m4-profile-control-p"
        : "m4-profile-control-c") ||
    value.profileId !== profileId ||
    value.containerImageDigest !== CONTROL_IMAGE_DIGEST ||
    value.hostInspectionComplete !== true ||
    value.controlEvidenceComplete !== true ||
    value.evidenceTransferred !== true ||
    value.complete !== true ||
    typeof value.manifestSha256 !== "string" ||
    !SHA256_PATTERN.test(value.manifestSha256) ||
    typeof value.hostInspectionSha256 !== "string" ||
    !SHA256_PATTERN.test(value.hostInspectionSha256) ||
    typeof value.controlEvidenceSha256 !== "string" ||
    !SHA256_PATTERN.test(value.controlEvidenceSha256)
  ) {
    fail();
  }
  exactArray(stringArray(value.inventory), expectedInventory);
}

interface ValidatedProfileResult {
  readonly validity: "complete" | "inconclusive";
  readonly failure: string | null;
  readonly steps: readonly string[];
}

function validateProfileResult(
  input: unknown,
  profileId: "permissive" | "constrained",
): ValidatedProfileResult | null {
  if (input === null) return null;
  const value = plainRecord(input, [
    "validity",
    "primaryFailure",
    "completedSteps",
    "comparison",
    "completion",
  ]);
  const runId =
    profileId === "permissive" ? PERMISSIVE_RUN_ID : CONSTRAINED_RUN_ID;
  const steps = validateProfileSteps(value.completedSteps, profileId);
  if (value.validity === "complete") {
    if (
      value.primaryFailure !== null ||
      value.comparison === null ||
      value.completion === null
    )
      fail();
    exactArray(
      steps,
      ["create", "inspect", "start", "transfer", "remove"].map(
        (step) => `${profileId}:${step}`,
      ),
    );
    validateComparison(value.comparison, profileId, runId);
    validateCompletion(value.completion, profileId, runId);
  } else if (value.validity === "inconclusive") {
    if (
      typeof value.primaryFailure !== "string" ||
      !EXECUTION_FAILURES.includes(value.primaryFailure) ||
      value.comparison !== null ||
      value.completion !== null
    ) {
      fail();
    }
  } else {
    fail();
  }
  return {
    validity: value.validity,
    failure:
      value.validity === "inconclusive"
        ? (value.primaryFailure as string)
        : null,
    steps,
  };
}

export function parseCanonicalPairResultForTest(bytes: Uint8Array): unknown {
  let containsBom = false;
  for (let index = 0; index + 2 < bytes.byteLength; index += 1) {
    if (
      bytes[index] === 0xef &&
      bytes[index + 1] === 0xbb &&
      bytes[index + 2] === 0xbf
    ) {
      containsBom = true;
      break;
    }
  }
  if (
    bytes.byteLength === 0 ||
    bytes.byteLength > OUTPUT_LIMIT ||
    containsBom ||
    bytes.at(-1) !== 0x0a ||
    bytes.slice(0, -1).includes(0x0a) ||
    bytes.includes(0x0d) ||
    bytes.includes(0x00)
  ) {
    fail();
  }
  let text: string;
  let parsed: unknown;
  try {
    text = fatalDecoder.decode(bytes);
    parsed = JSON.parse(text.slice(0, -1));
  } catch {
    return fail();
  }
  if (`${JSON.stringify(parsed)}\n` !== text) fail();
  const value = plainRecord(parsed, [
    "validity",
    "primaryFailure",
    "completedSteps",
    "permissive",
    "constrained",
  ]);
  const permissiveSteps = validateProfileResult(value.permissive, "permissive");
  const constrainedSteps = validateProfileResult(
    value.constrained,
    "constrained",
  );
  const allSteps = stringArray(value.completedSteps);
  exactArray(allSteps, [
    ...(permissiveSteps?.steps ?? []),
    ...(constrainedSteps?.steps ?? []),
  ]);
  if ((permissiveSteps === null) !== (constrainedSteps === null)) fail();
  if (value.validity === "complete") {
    if (
      value.primaryFailure !== null ||
      value.permissive === null ||
      value.constrained === null ||
      permissiveSteps?.validity !== "complete" ||
      constrainedSteps?.validity !== "complete"
    ) {
      fail();
    }
  } else if (value.validity === "inconclusive") {
    if (
      typeof value.primaryFailure !== "string" ||
      !EXECUTION_FAILURES.includes(value.primaryFailure) ||
      (permissiveSteps !== null &&
        value.primaryFailure !==
          (permissiveSteps.failure ??
            constrainedSteps?.failure ??
            "CLEANUP_FAILURE"))
    ) {
      fail();
    }
  } else {
    fail();
  }
  return parsed;
}

function activationResult(
  validity: "complete" | "inconclusive",
  primaryFailure: PublicFailure | null,
  completedSteps: readonly string[],
  controlResult: unknown,
): Uint8Array {
  return encoder.encode(
    `${JSON.stringify({
      schemaVersion: "lab-m4-activation-result/v1",
      expectedRevision: EXPECTED_REVISION,
      validity,
      primaryFailure,
      completedSteps,
      activation: {
        logicalRole: "m4-frozen-research-profile-control-activation",
        sourceBytes: ACTIVATION_SOURCE_BYTES,
        sourceSha256: ACTIVATION_SOURCE_SHA256,
        executableBytes: ACTIVATION_EXECUTABLE_BYTES,
        executableSha256: ACTIVATION_EXECUTABLE_SHA256,
        identityStable: true,
      },
      controlResult,
    })}\n`,
  );
}

class FailureLatch {
  value: WrapperFailure | null = null;

  set(value: WrapperFailure): void {
    this.value ??= value;
  }
}

function tuple(code: unknown, signal: unknown): ExitTuple {
  if (
    code !== null &&
    (typeof code !== "number" || !Number.isSafeInteger(code))
  ) {
    fail();
  }
  if (signal !== null && typeof signal !== "string") fail();
  return { code: code as number | null, signal: signal as string | null };
}

function sameTuple(left: ExitTuple, right: ExitTuple): boolean {
  return left.code === right.code && left.signal === right.signal;
}

async function releaseOrSuppress(
  lease: ExecutorIdentityLeaseForTest,
  boundaries: ExecutorBoundariesForTest,
  terminal?: string,
): Promise<boolean> {
  try {
    await lease.close();
  } catch {
    boundaries.setExitCode(70);
    return false;
  }
  if (terminal !== undefined) boundaries.writeStderr(encoder.encode(terminal));
  return true;
}

export async function executeFrozenResearchBoundaryForTest(
  lease: ExecutorIdentityLeaseForTest,
  boundaries: ExecutorBoundariesForTest,
): Promise<void> {
  const completedSteps = ["identity-preflight"];
  let child: ExecutorChildForTest;
  try {
    child = boundaries.spawnChild();
  } catch {
    try {
      await lease.validate();
      await lease.validate();
    } catch {
      await releaseOrSuppress(lease, boundaries);
      boundaries.setExitCode(70);
      return;
    }
    if (
      await releaseOrSuppress(lease, boundaries, "M4_ACTIVATION_SPAWN_FAILED\n")
    ) {
      boundaries.setExitCode(70);
    }
    return;
  }
  completedSteps.push("child-spawned");
  const latch = new FailureLatch();
  const stdout: Uint8Array[] = [];
  const stderr: Uint8Array[] = [];
  let observedBytes = 0;
  let retainedBytes = 0;
  let exitTuple: ExitTuple | null = null;
  let exitCount = 0;
  let closed = false;
  let termRequested = false;
  let graceTimer: unknown = null;

  const signal = (name: "SIGTERM" | "SIGKILL"): void => {
    const pid = child.pid;
    if (
      typeof pid !== "number" ||
      !Number.isSafeInteger(pid) ||
      pid <= 0 ||
      latch.value === null
    ) {
      latch.set("ACTIVATION_PROCESS_FAILURE");
      return;
    }
    try {
      if (!boundaries.signalGroup(pid, name)) {
        latch.set("ACTIVATION_PROCESS_FAILURE");
      }
    } catch {
      latch.set("ACTIVATION_PROCESS_FAILURE");
    }
  };
  const requestTerm = (): void => {
    if (termRequested) return;
    termRequested = true;
    signal("SIGTERM");
    graceTimer = boundaries.schedule(() => {
      if (!closed) signal("SIGKILL");
    }, SIGNAL_GRACE_MS);
  };
  const observe = (chunks: Uint8Array[], chunk: Uint8Array): void => {
    const added = chunk.byteLength;
    observedBytes = Math.min(observedBytes + added, OUTPUT_LIMIT + 1);
    const available = Math.max(0, OUTPUT_LIMIT - retainedBytes);
    if (available > 0) {
      const retained = Uint8Array.from(chunk.subarray(0, available));
      chunks.push(retained);
      retainedBytes += retained.byteLength;
    }
    if (observedBytes > OUTPUT_LIMIT) {
      latch.set("ACTIVATION_OUTPUT_LIMIT");
      requestTerm();
    }
  };

  const timeoutTimer = boundaries.schedule(() => {
    if (!closed) {
      latch.set("ACTIVATION_TIMEOUT");
      requestTerm();
    }
  }, TIMEOUT_MS);

  const closeTuple = await new Promise<ExitTuple>((resolve) => {
    child.on("error", () => latch.set("ACTIVATION_PROCESS_FAILURE"));
    child.on("exit", (code, signalName) => {
      exitCount += 1;
      let current: ExitTuple;
      try {
        current = tuple(code, signalName);
      } catch {
        latch.set("ACTIVATION_PROCESS_FAILURE");
        return;
      }
      if (exitTuple !== null && !sameTuple(exitTuple, current)) {
        latch.set("ACTIVATION_PROCESS_FAILURE");
      }
      exitTuple ??= current;
      if (exitCount !== 1) latch.set("ACTIVATION_PROCESS_FAILURE");
    });
    child.on("close", (code, signalName) => {
      if (closed) {
        latch.set("ACTIVATION_PROCESS_FAILURE");
        return;
      }
      closed = true;
      try {
        resolve(tuple(code, signalName));
      } catch {
        latch.set("ACTIVATION_PROCESS_FAILURE");
        resolve({ code: null, signal: null });
      }
    });
    if (child.stdout === null || child.stderr === null) {
      latch.set("ACTIVATION_PROCESS_FAILURE");
    } else {
      child.stdout.on("data", (chunk) => observe(stdout, chunk));
      child.stderr.on("data", (chunk) => observe(stderr, chunk));
    }
  });
  boundaries.cancel(timeoutTimer);
  if (graceTimer !== null) boundaries.cancel(graceTimer);
  completedSteps.push("child-closed");
  if (
    exitCount !== 1 ||
    exitTuple === null ||
    !sameTuple(exitTuple, closeTuple) ||
    closeTuple.signal !== null ||
    (closeTuple.code !== 0 && closeTuple.code !== 1)
  ) {
    latch.set("ACTIVATION_PROCESS_FAILURE");
  }

  let controlResult: unknown = null;
  try {
    await lease.validate();
    if (latch.value === null) {
      const stdoutBytes = new Uint8Array(
        stdout.reduce((total, chunk) => total + chunk.byteLength, 0),
      );
      let offset = 0;
      for (const chunk of stdout) {
        stdoutBytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const stderrBytes = stderr.reduce(
        (total, chunk) => total + chunk.byteLength,
        0,
      );
      try {
        if (stderrBytes !== 0) fail();
        controlResult = parseCanonicalPairResultForTest(stdoutBytes);
        const childValidity = (controlResult as { readonly validity: unknown })
          .validity;
        if (
          (closeTuple.code === 0 && childValidity !== "complete") ||
          (closeTuple.code === 1 && childValidity !== "inconclusive")
        ) {
          fail();
        }
      } catch {
        latch.set("CONTROL_RESULT_INVALID");
        controlResult = null;
      }
    }
    await lease.validate();
    completedSteps.push("identity-postflight");
  } catch {
    if (
      await releaseOrSuppress(
        lease,
        boundaries,
        "M4_ACTIVATION_IDENTITY_CHANGED\n",
      )
    ) {
      boundaries.setExitCode(70);
    }
    return;
  }

  if (!(await releaseOrSuppress(lease, boundaries))) return;
  if (latch.value !== null) {
    boundaries.writeStdout(
      activationResult("inconclusive", latch.value, completedSteps, null),
    );
    boundaries.setExitCode(1);
    return;
  }
  completedSteps.push("control-result-validated");
  const childValidity = (controlResult as { readonly validity: unknown })
    .validity;
  if (childValidity === "complete") {
    boundaries.writeStdout(
      activationResult("complete", null, completedSteps, controlResult),
    );
    boundaries.setExitCode(0);
  } else {
    boundaries.writeStdout(
      activationResult(
        "inconclusive",
        "CONTROL_INCONCLUSIVE",
        completedSteps,
        controlResult,
      ),
    );
    boundaries.setExitCode(1);
  }
}

async function runProduction(): Promise<void> {
  if (
    process.argv.length !== 2 ||
    process.platform !== "linux" ||
    process.arch !== "x64" ||
    process.version !== "v20.18.2"
  ) {
    process.exitCode = 70;
    return;
  }
  const modulePath = fileURLToPath(import.meta.url);
  if ((await realpath(process.argv[1]!)) !== modulePath) {
    process.exitCode = 70;
    return;
  }
  const repositoryRootCandidate = path.resolve(modulePath, "../../../../");
  const repositoryRoot = await realpath(repositoryRootCandidate);
  if (repositoryRoot !== repositoryRootCandidate) {
    process.exitCode = 70;
    return;
  }
  let lease: ProductionIdentityLease | null = null;
  try {
    lease = await captureProductionLease(repositoryRoot);
    await lease.validate();
  } catch {
    await lease?.close().catch(() => undefined);
    process.exitCode = 70;
    return;
  }
  const activationPath = path.join(
    repositoryRoot,
    "containers",
    "profile-control",
    "dist",
    "frozen-research-profile-control-entry.js",
  );
  await executeFrozenResearchBoundaryForTest(lease, {
    spawnChild: () =>
      spawn(process.execPath, [activationPath, "run-controls"], {
        cwd: repositoryRoot,
        env: Object.freeze({}),
        shell: false,
        windowsHide: true,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
      }) as unknown as ExecutorChildForTest,
    signalGroup: (pid, signalName) => process.kill(-pid, signalName),
    schedule: (callback, milliseconds) => setTimeout(callback, milliseconds),
    cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
    writeStdout: (bytes) => {
      process.stdout.write(bytes);
    },
    writeStderr: (bytes) => {
      process.stderr.write(bytes);
    },
    setExitCode: (code) => {
      process.exitCode = code;
    },
  });
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  path.resolve(invokedPath) === fileURLToPath(import.meta.url)
) {
  await runProduction().catch(() => {
    process.exitCode = 70;
  });
}
