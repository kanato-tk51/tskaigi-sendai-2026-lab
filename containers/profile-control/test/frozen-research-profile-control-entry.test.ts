import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const controlRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(controlRoot, "../..");
const activationBasename = "frozen-research-profile-control-entry";
const sourcePath = path.join(controlRoot, "src", `${activationBasename}.ts`);
const javascriptPath = path.join(
  controlRoot,
  "dist",
  `${activationBasename}.js`,
);
const declarationPath = path.join(
  controlRoot,
  "dist",
  `${activationBasename}.d.ts`,
);

const expectedSource = `import process from "node:process";

import { ProfileControlError } from "./errors.js";
import { parseOrchestratorArguments } from "./orchestrator.js";
import {
  runFixedProductionControls,
  serializeCanonicalPairExecutionResult,
} from "./run-controls.js";

try {
  if (parseOrchestratorArguments(process.argv.slice(2)) !== "run-controls") {
    throw new Error("M4_CONTROL_OPERATION");
  }
  const result = await runFixedProductionControls();
  process.stdout.write(serializeCanonicalPairExecutionResult(result));
  process.exitCode = result.validity === "complete" ? 0 : 1;
} catch (error) {
  const code =
    error instanceof ProfileControlError
      ? error.code
      : "M4_CONTROL_EXECUTION_FAILED";
  process.stderr.write(\`\${code}\\n\`);
  process.exitCode = 1;
}
`;

interface ConstructionRow {
  readonly source: readonly [byteLength: number, sha256: string];
  readonly javascript: readonly [byteLength: number, sha256: string];
  readonly declaration: readonly [byteLength: number, sha256: string];
}

const constructionRows = {
  canonical: {
    source: [
      2_203,
      "4f635c6bb7ac6cbc6a9c3488028277e7eddac37061b80c4b848524dad0ba8699",
    ],
    javascript: [
      2_009,
      "bbe3f25a2a11177c393dbcb272258ebdd097fba230850c9a5a8c4679c33b3a62",
    ],
    declaration: [
      462,
      "c05481f834670411ca5bfe04ba1fabc028e4f06f80b23b7f1bd120777b0ccc93",
    ],
  },
  completion: {
    source: [
      6_655,
      "73e94cd1b65ae068ce742219a7e9e903c8a2564ea1193ad265ac90d4a98c6840",
    ],
    javascript: [
      5_946,
      "a8dcd3f5cc088de86e190e9d5ed6062eb8f9c030e3ebafb2a873150d3091d771",
    ],
    declaration: [
      892,
      "a31f726ee15aba4ab13e91641b413d374365c602adf890ae9bb87815beb1c8d0",
    ],
  },
  constants: {
    source: [
      4_635,
      "60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65",
    ],
    javascript: [
      4_298,
      "2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb",
    ],
    declaration: [
      4_628,
      "d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651",
    ],
  },
  "control-host-backend": {
    source: [
      39_867,
      "a37baa7dd651a1346c9f38b6116a38a7ddc0c4e33f83f4ceae3d804c6bfd646f",
    ],
    javascript: [
      37_690,
      "e4685e4fda539e35ef3bdfb984191fd6fbefc4ee3bab9fffc41635e610a51125",
    ],
    declaration: [
      942,
      "6c47c9ab43b57ad1ff673f6f4e4dead732408f458fa2afbcf08cb647a0ebef1f",
    ],
  },
  definitions: {
    source: [
      7_776,
      "e20c0bf8135d0db349a50525154181bc5c4b1cb2282b2f7933cabdb0c779d38e",
    ],
    javascript: [
      7_451,
      "00eb73c608968cbcf15c5ae0c9fad62aca44a6390411cadc89f0ae1762029def",
    ],
    declaration: [
      916,
      "461df2c274834f3406868d544069814a65555d55f81a8e1ed8573e9698928c2c",
    ],
  },
  "docker-formats": {
    source: [
      2_519,
      "6f24020cdd1a54b9fa8abfbee665babf99fc3a0a0240f7892b5b924f7c945725",
    ],
    javascript: [
      2_462,
      "d4fe03deb175079f4b9b8c115833334e4ce33681cb41d918ec271a4f06f375b6",
    ],
    declaration: [
      4_559,
      "2875745d66b306a09954cd8277f73c5b8ddc6bfe8a13328c5f940e32f6a49d1b",
    ],
  },
  "docker-plan": {
    source: [
      13_008,
      "5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1",
    ],
    javascript: [
      10_813,
      "030bc5d603ddebf3320fb3212d45ee1320af1a0c126252566cbea3abb727ab13",
    ],
    declaration: [
      3_313,
      "5f4a2edcc08d2577610dd080ee78b1481760938adf523dffcafb1a330acfc42a",
    ],
  },
  errors: {
    source: [
      369,
      "d4e96236380e93154e8c9e1cb70680bb731fb67e28fbe9c0ba37594ca38de709",
    ],
    javascript: [
      260,
      "d6759eb698e8a06bebbf30ea2ec36fc9881dcd3a23af5bef4ba034e4f82a177a",
    ],
    declaration: [
      261,
      "23adfef21df4ed57fb15ba36f9ed09289cf3c75c00f3b97ab86612f46b574b52",
    ],
  },
  evidence: {
    source: [
      5_741,
      "2d562c1f988b2592d897af5f94d77d417f3c3e3e723ae8257ac9eda7600a7a96",
    ],
    javascript: [
      5_419,
      "be6e8bca77e54691b5619495a6f636634ceed05923f2ce0a72c84dc6ca146586",
    ],
    declaration: [
      391,
      "ece686d251e68a63e740d31b7ed9e20664c1bc63764f7d852c3c2027a30cf4bf",
    ],
  },
  execution: {
    source: [
      20_725,
      "4e893140d85351c45b1ac96afca89d95830fd3862c322a464731b7d087ebabde",
    ],
    javascript: [
      17_918,
      "3e178ab0293e575b0755f70274eba4248109f19a48b6781b1af6a7c4bf8354ac",
    ],
    declaration: [
      2_364,
      "dc85a74e27a8108f0946326bcec4e9a19f46d13e4819159d72e59e0025b167b9",
    ],
  },
  "filesystem-identity": {
    source: [
      25_227,
      "1dad4648451daaf3681a1eb07a196f6c361513e75f63a0eff94ebe665a67abf1",
    ],
    javascript: [
      22_909,
      "a6692c54e71a4d3b54ed8f29f66b40cdc2a1eb8fc1d5f1660fe5c439c4453385",
    ],
    declaration: [
      4_644,
      "a987a326d7659aa49dc69b60b4c744912a141e1f6c6892641e2296a9263a6daa",
    ],
  },
  "frozen-research-profile-control-entry": {
    source: [
      774,
      "580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d",
    ],
    javascript: [
      788,
      "34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7",
    ],
    declaration: [
      11,
      "8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881",
    ],
  },
  "image-input": {
    source: [
      3_117,
      "3d62d6842d7b0aafde8cc42a647c31235860411a9c77acaaae8e60b4de7fe16c",
    ],
    javascript: [
      2_946,
      "280fc04ba2dd7900755b335a2f599791adb52012b65adbc499fbd92caf949380",
    ],
    declaration: [
      319,
      "47eef11d826490aa6fb7d472ab25efc0edaf847346f9a046688ea2c650b28432",
    ],
  },
  inspect: {
    source: [
      8_888,
      "9c24c147ba5d2ef03606c9be3af1d9e7cdcd6aa14de6259960e14c6310b5c1d8",
    ],
    javascript: [
      8_403,
      "a1304f9668c421c55f861f65486cb3a006aac870c0810cb648ed04dc5f15733e",
    ],
    declaration: [
      466,
      "7476ad3237a5e95d816b26ce5a5efed40c08c6c88118c670bba35418911f3f07",
    ],
  },
  "offline-build-process": {
    source: [
      1_780,
      "e32177d3c8f1f6be31f37572aeaf8abf12da961527cb1a830dd2121d1c08639c",
    ],
    javascript: [
      1_345,
      "a0cf7c8d936ea96e328c1cd57b9cba315c9c2e9ac00144aeb15202198229d8ba",
    ],
    declaration: [
      694,
      "ff8a0df29777071b3e50750bd1c5383536b9dbc752f49168cb57fa56f9e181d2",
    ],
  },
  orchestrator: {
    source: [
      755,
      "fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6",
    ],
    javascript: [
      547,
      "a71204ff47db0c548f107af2714b270249b4109a570333d1a8478bfb421a6c6d",
    ],
    declaration: [
      379,
      "e707246ff2068215121040d0544aef3fa75ff581447fb47e0e4ee31eac43e25c",
    ],
  },
  "profile-input": {
    source: [
      1_873,
      "a2d799a8d86bc82d4c64e767ffb289277ed9c391293711f69a0bd5ec53df2844",
    ],
    javascript: [
      1_714,
      "5471dab87a02f809263bc570d8362b52d19c579ef526eec59e5e725b4a7da50b",
    ],
    declaration: [
      318,
      "5429cb52fe983239d214e1d50748622f40748953661f24efed9f7d75775f96ad",
    ],
  },
  "run-controls": {
    source: [
      7_924,
      "25a0fd3b204594271970ddbd7d644ee2c12d5dbd31ad9a906150f293e3f4f550",
    ],
    javascript: [
      7_457,
      "e53ec9ecf25c020a138aecd3ca4e5c1b6363e553591f1056c118daf88eeb020d",
    ],
    declaration: [
      441,
      "e027528b9396bcf5cfd790bfee355c67cb35c3292595c512cd0d18efc66d3408",
    ],
  },
  "safe-data": {
    source: [
      4_208,
      "9f2816f356907c3280cc7fd3c20f3d4eb3e97f5db1dc1ddca0d10a70daef0c88",
    ],
    javascript: [
      3_860,
      "7ad600291ce3da4b7cc884e48e1c8ac7bb5ee2d13cd738df7ff8d6240271bdd5",
    ],
    declaration: [
      934,
      "1f4a5978637337d07b9ea79da6a9b7c1db69a8b09ba16f68e90c978a5b5cf0bd",
    ],
  },
  staging: {
    source: [
      7_695,
      "795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5",
    ],
    javascript: [
      6_973,
      "823efef60cdf17799755c0c589d13cbba1c74f688e368fa865670ae6e85350a0",
    ],
    declaration: [
      1_028,
      "5c218a4ec00455c7a5fa412ca28d5b56f42df642ab78700175b267de0ec33d04",
    ],
  },
  types: {
    source: [
      9_581,
      "9bed7d4a65033d9b120666c6c2848f03e75cf2a7ca9d4f1fb6f9f59050d4d3c3",
    ],
    javascript: [
      11,
      "8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881",
    ],
    declaration: [
      9_768,
      "e5485ee736d5b42ad81258a2f8e7a8dfb75d27d3ae2ec1ee757108142adc13cd",
    ],
  },
  validation: {
    source: [
      14_486,
      "5e8952f317b1a2b9555968df54c02a784ce581c1762b774ec677eb8139eb3404",
    ],
    javascript: [
      13_563,
      "25b24fd56adb78af26dc3ff490d5f6d9e4a4b53b962dc04e0a18ef3b7b3fd52f",
    ],
    declaration: [
      457,
      "1d34988ade527f386a35b854db608959f5dd6de3d6d09ac4d975089c6d035d8a",
    ],
  },
} as const satisfies Readonly<Record<string, ConstructionRow>>;

const sourceModules = Object.keys(constructionRows);
const executableModules = sourceModules.filter((name) => name !== "types");
const issue46SourceAllowlist = new Set([
  "safe-data",
  "canonical",
  "completion",
  "definitions",
  "docker-plan",
  "doctor",
  "evidence",
  "execution",
  "image-input",
  "inspect",
  "offline-build-process",
  "offline-build",
  "offline-build-recovery",
  "orchestrator",
  "profile-input",
  "run-controls",
  "staging",
  "types",
  "validation",
]);
const historicalSourceEdgeIdentity = Object.freeze([
  1_789,
  "d83d8d353fcdddfc95eca1d4cb044627172fafe52d3bc71677d094f9bd690495",
] as const);
const expectedSourceInventory = [
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
];
const expectedCompiledInventory = expectedSourceInventory
  .flatMap((name) => {
    const basename = name.slice(0, -3);
    return [`${basename}.d.ts`, `${basename}.js`];
  })
  .sort();

function sha256(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactOrderedSet(
  label: string,
  actual: readonly string[],
  expected: readonly string[],
): void {
  if (
    actual.length !== expected.length ||
    actual.some((entry, index) => entry !== expected[index])
  ) {
    throw new Error(`M4_ACTIVATION_${label}`);
  }
}

interface RelativeEdge {
  readonly target: string;
  readonly typeOnly: boolean;
}

function moduleBasename(specifier: string): string {
  const basename = path.posix.basename(specifier);
  return basename.replace(/\.(?:d\.)?[cm]?[jt]s$/u, "");
}

function syntaxEdges(
  source: string,
  scriptKind: ts.ScriptKind,
): readonly RelativeEdge[] {
  const file = ts.createSourceFile(
    scriptKind === ts.ScriptKind.TS ? "module.ts" : "module.js",
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const edges: RelativeEdge[] = [];
  function visit(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      throw new Error("M4_ACTIVATION_FORBIDDEN_LOADING_FORM");
    }
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined
    ) {
      if (!ts.isStringLiteral(node.moduleSpecifier)) {
        throw new Error("M4_ACTIVATION_COMPUTED_IMPORT");
      }
      const specifier = node.moduleSpecifier.text;
      if (specifier.startsWith("node:")) return;
      if (!specifier.startsWith("./")) {
        throw new Error("M4_ACTIVATION_PACKAGE_IMPORT");
      }
      const typeOnly = ts.isImportDeclaration(node)
        ? (node.importClause?.isTypeOnly ?? false) ||
          (node.importClause?.namedBindings !== undefined &&
            ts.isNamedImports(node.importClause.namedBindings) &&
            node.importClause.namedBindings.elements.every(
              (element) => element.isTypeOnly,
            ))
        : node.isTypeOnly;
      edges.push({ target: moduleBasename(specifier), typeOnly });
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return edges;
}

async function deriveClosure(
  directory: "dist" | "src",
  extension: "js" | "ts",
  scriptKind: ts.ScriptKind,
): Promise<ReadonlyMap<string, readonly RelativeEdge[]>> {
  const graph = new Map<string, readonly RelativeEdge[]>();
  const pending = [activationBasename];
  while (pending.length > 0) {
    const current = pending.shift();
    if (current === undefined || graph.has(current)) continue;
    const source = await readFile(
      path.join(controlRoot, directory, `${current}.${extension}`),
      "utf8",
    );
    const edges = syntaxEdges(source, scriptKind);
    graph.set(current, edges);
    for (const edge of edges) {
      if (!graph.has(edge.target)) pending.push(edge.target);
    }
  }
  return graph;
}

function graphManifest(
  graph: ReadonlyMap<string, readonly RelativeEdge[]>,
): string {
  return [...graph.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([moduleName, edges]) =>
        `${moduleName}\0${edges
          .map(
            ({ target, typeOnly }) =>
              `${target}:${typeOnly ? "type" : "value"}`,
          )
          .sort()
          .join(",")}\n`,
    )
    .join("");
}

function manifestRow(logicalPath: string, bytes: Uint8Array): string {
  return `${logicalPath}\0${bytes.byteLength}\0${sha256(bytes)}\n`;
}

async function compileInMemory(): Promise<ReadonlyMap<string, Uint8Array>> {
  expect(ts.version).toBe("5.9.3");
  const configPath = path.join(controlRoot, "tsconfig.build.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error !== undefined) throw new Error("M4_ACTIVATION_TSC_CONFIG");
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    controlRoot,
    undefined,
    configPath,
  );
  const outputs = new Map<string, Uint8Array>();
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const emit = program.emit(undefined, (fileName, data) => {
    outputs.set(path.basename(fileName), Buffer.from(data, "utf8"));
  });
  const diagnostics = [
    ...ts.getPreEmitDiagnostics(program),
    ...emit.diagnostics,
  ];
  expect(diagnostics).toEqual([]);
  expect(emit.emitSkipped).toBe(false);
  return outputs;
}

describe("M4 dormant frozen-research activation object", () => {
  it("matches the exact source, compiler output, inventories, and manifests", async () => {
    const sourceBytes = await readFile(sourcePath);
    const javascriptBytes = await readFile(javascriptPath);
    const declarationBytes = await readFile(declarationPath);
    expect(sourceBytes.toString("utf8")).toBe(expectedSource);
    expect([sourceBytes.byteLength, sha256(sourceBytes)]).toEqual(
      constructionRows[activationBasename].source,
    );
    expect([javascriptBytes.byteLength, sha256(javascriptBytes)]).toEqual(
      constructionRows[activationBasename].javascript,
    );
    expect([declarationBytes.byteLength, sha256(declarationBytes)]).toEqual(
      constructionRows[activationBasename].declaration,
    );
    expect((await readdir(path.join(controlRoot, "src"))).sort()).toEqual(
      expectedSourceInventory,
    );
    expect((await readdir(path.join(controlRoot, "dist"))).sort()).toEqual(
      expectedCompiledInventory,
    );

    let sourceManifest = "";
    let currentSourceManifest = "";
    let compiledManifest = "";
    for (const moduleName of sourceModules) {
      const row = constructionRows[moduleName as keyof typeof constructionRows];
      const sourceLogicalPath = `containers/profile-control/src/${moduleName}.ts`;
      const javascriptLogicalPath = `containers/profile-control/dist/${moduleName}.js`;
      const declarationLogicalPath = `containers/profile-control/dist/${moduleName}.d.ts`;
      const moduleSource = await readFile(
        path.join(repositoryRoot, sourceLogicalPath),
      );
      const moduleJavascript = await readFile(
        path.join(repositoryRoot, javascriptLogicalPath),
      );
      const moduleDeclaration = await readFile(
        path.join(repositoryRoot, declarationLogicalPath),
      );
      const currentSourceIdentity = [
        moduleSource.byteLength,
        sha256(moduleSource),
      ] as const;
      if (
        currentSourceIdentity[0] !== row.source[0] ||
        currentSourceIdentity[1] !== row.source[1]
      ) {
        expect(issue46SourceAllowlist.has(moduleName)).toBe(true);
      }
      expect([moduleJavascript.byteLength, sha256(moduleJavascript)]).toEqual(
        row.javascript,
      );
      expect([moduleDeclaration.byteLength, sha256(moduleDeclaration)]).toEqual(
        row.declaration,
      );
      sourceManifest += `${sourceLogicalPath}\0${row.source[0]}\0${row.source[1]}\n`;
      currentSourceManifest += manifestRow(sourceLogicalPath, moduleSource);
      compiledManifest += manifestRow(javascriptLogicalPath, moduleJavascript);
      compiledManifest += manifestRow(
        declarationLogicalPath,
        moduleDeclaration,
      );
    }
    expect([Buffer.byteLength(sourceManifest), sha256(sourceManifest)]).toEqual(
      [
        2_582,
        "d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158",
      ],
    );
    expect([
      Buffer.byteLength(compiledManifest),
      sha256(compiledManifest),
    ]).toEqual([
      5_232,
      "04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953",
    ]);
    expect([
      Buffer.byteLength(sourceManifest + compiledManifest),
      sha256(sourceManifest + compiledManifest),
    ]).toEqual([
      7_814,
      "7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec",
    ]);
    expect([
      Buffer.byteLength(currentSourceManifest),
      sha256(currentSourceManifest),
    ]).toEqual([
      2_585,
      "65bd9c122281c8934d603afbd1aca07ca8d56c8a39b4cec12e1511528d76a445",
    ]);

    const outputs = await compileInMemory();
    exactOrderedSet(
      "COMPILED_INVENTORY",
      [...outputs.keys()].sort(),
      expectedCompiledInventory,
    );
    const divergentOutputs: string[] = [];
    for (const outputName of expectedCompiledInventory) {
      const output = outputs.get(outputName);
      const historicalOutput = await readFile(
        path.join(controlRoot, "dist", outputName),
      );
      if (
        output === undefined ||
        Buffer.compare(output, historicalOutput) !== 0
      ) {
        const moduleName = outputName.replace(/\.(?:d\.ts|js)$/u, "");
        expect(issue46SourceAllowlist.has(moduleName)).toBe(true);
        divergentOutputs.push(outputName);
      }
    }
    expect(divergentOutputs).toContain("safe-data.js");
  });

  it("binds the 22-source, 22-construction, and 21-executable closures", async () => {
    const sourceGraph = await deriveClosure("src", "ts", ts.ScriptKind.TS);
    exactOrderedSet(
      "SOURCE_CLOSURE",
      [...sourceGraph.keys()].sort(),
      sourceModules,
    );
    expect(
      sourceGraph
        .get(activationBasename)
        ?.map(({ target }) => target)
        .sort(),
    ).toEqual(["errors", "orchestrator", "run-controls"]);
    const typeEdges = [...sourceGraph.values()]
      .flat()
      .filter(({ target }) => target === "types");
    expect(typeEdges.length).toBeGreaterThan(0);
    expect(typeEdges.every(({ typeOnly }) => typeOnly)).toBe(true);
    const sourceEdgeManifest = graphManifest(sourceGraph);
    expect(historicalSourceEdgeIdentity).toEqual([
      1_789,
      "d83d8d353fcdddfc95eca1d4cb044627172fafe52d3bc71677d094f9bd690495",
    ]);
    expect([
      Buffer.byteLength(sourceEdgeManifest),
      sha256(sourceEdgeManifest),
    ]).toEqual([
      2_002,
      "b6da821f37515e16405de29b29486b2f9081b6d3d238b2d46207563396852434",
    ]);

    const javascriptGraph = await deriveClosure("dist", "js", ts.ScriptKind.JS);
    exactOrderedSet(
      "EXECUTABLE_CLOSURE",
      [...javascriptGraph.keys()].sort(),
      executableModules,
    );
    expect(
      [...javascriptGraph.values()]
        .flat()
        .some(({ target }) => target === "types"),
    ).toBe(false);
    const executableEdgeManifest = graphManifest(javascriptGraph);
    expect([
      Buffer.byteLength(executableEdgeManifest),
      sha256(executableEdgeManifest),
    ]).toEqual([
      1_528,
      "c0c33de9b2b1625625c31d598fd0bf1a904f1207075c4c24c6591b1573042ff3",
    ]);
    expect(
      await readFile(path.join(controlRoot, "dist/types.js"), "utf8"),
    ).toBe("export {};\n");
    const constructedNames = await readdir(path.join(controlRoot, "dist"));
    exactOrderedSet(
      "JAVASCRIPT_CONSTRUCTION",
      constructedNames
        .filter((name) => name.endsWith(".js"))
        .map((name) => name.slice(0, -3))
        .filter((name) => sourceModules.includes(name))
        .sort(),
      sourceModules,
    );
    exactOrderedSet(
      "DECLARATION_CONSTRUCTION",
      constructedNames
        .filter((name) => name.endsWith(".d.ts"))
        .map((name) => name.slice(0, -5))
        .filter((name) => sourceModules.includes(name))
        .sort(),
      sourceModules,
    );
  });

  it("rejects contracted set and loading-form drift", () => {
    expect(() =>
      exactOrderedSet("MISSING", sourceModules.slice(1), sourceModules),
    ).toThrow("M4_ACTIVATION_MISSING");
    expect(() =>
      exactOrderedSet("EXTRA", [...sourceModules, "extra"], sourceModules),
    ).toThrow("M4_ACTIVATION_EXTRA");
    expect(() =>
      exactOrderedSet(
        "REORDERED",
        [sourceModules[1]!, sourceModules[0]!, ...sourceModules.slice(2)],
        sourceModules,
      ),
    ).toThrow("M4_ACTIVATION_REORDERED");
    for (const forbidden of [
      'await import("./types.js");',
      'require("./types.js");',
      'import value from "package-name";',
    ]) {
      expect(() => syntaxEdges(forbidden, ts.ScriptKind.JS)).toThrow();
    }
  });

  it("remains unreachable from package exports, scripts, and production sources", async () => {
    const rootPackage = JSON.parse(
      await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
    ) as { readonly scripts?: Readonly<Record<string, string>> };
    expect(JSON.stringify(rootPackage.scripts)).not.toContain(
      activationBasename,
    );
    const packagesRoot = path.join(repositoryRoot, "packages");
    const workspaces = (
      await readdir(packagesRoot, { withFileTypes: true })
    ).filter((entry) => entry.isDirectory());
    for (const workspace of workspaces) {
      const packageSource = await readFile(
        path.join(packagesRoot, workspace.name, "package.json"),
        "utf8",
      );
      expect(packageSource).not.toContain(activationBasename);
    }
    for (const sourceName of await readdir(path.join(controlRoot, "src"))) {
      if (
        sourceName === `${activationBasename}.ts` ||
        sourceName === "frozen-research-profile-control-executor.ts"
      ) {
        continue;
      }
      const source = await readFile(
        path.join(controlRoot, "src", sourceName),
        "utf8",
      );
      expect(source).not.toContain(activationBasename);
    }
    for (const entry of [
      "src/index.ts",
      "src/orchestrator.ts",
      "src/orchestrator-entry.ts",
      "src/offline-build-recovery-entry.ts",
      "dist/index.js",
      "dist/index.d.ts",
      "dist/orchestrator.js",
      "dist/orchestrator-entry.js",
    ]) {
      const source = await readFile(path.join(controlRoot, entry), "utf8");
      expect(source).not.toContain(activationBasename);
      expect(source).not.toContain("runFixedProductionControls");
      expect(source).not.toContain("control-host-backend");
    }
    const wrapperSource = await readFile(
      path.join(controlRoot, "src/frozen-research-profile-control-executor.ts"),
      "utf8",
    );
    expect(wrapperSource).toContain(
      '"frozen-research-profile-control-entry.js"',
    );
    expect(wrapperSource).not.toContain(
      'from "./frozen-research-profile-control-entry.js"',
    );
  });
});
