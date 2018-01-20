    if (typeof global === "object") {
        global.require = require;
    }
    var _d78f = {};
    _d78f.f = {}
    // cached modules
    _d78f.m = {};
    _d78f.s = function(id) {
        var result = _d78f.r(id);
        if (result === undefined) {
            return require(id);
        }
    }
    _d78f.r = function(id) {
        var cached = _d78f.m[id];
        // resolve if in cache
        if (cached) {
            return cached.m.exports;
        }
        var file = _d78f.f[id];
        if (!file)
            return;
        cached = _d78f.m[id] = {};
        cached.exports = {};
        cached.m = { exports: cached.exports };
        file(cached.m, cached.exports);
        return cached.m.exports;
    };
// stricter/index.js
_d78f.f[0] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
var stricter_1 = _d78f.r(1);
exports.stricter = stricter_1.default;
var cli_1 = _d78f.r(19);
exports.cli = cli_1.default;
var processor_1 = _d78f.r(9);
exports.readFilesData = processor_1.readFilesData;
var dependencies_1 = _d78f.r(11);
exports.readDependencies = dependencies_1.default;
}
// stricter/stricter.js
_d78f.f[1] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = _d78f.r(2);
const rule_1 = _d78f.r(6);
const processor_1 = _d78f.r(9);
const dependencies_1 = _d78f.r(11);
const logger_1 = _d78f.r(15);
const utils_1 = _d78f.r(7);
const types_1 = _d78f.r(10);
exports.default = ({silent = false, reporter = types_1.Reporter.CONSOLE, configPath}) => {
    if (!silent) {
        console.log('Stricter: Checking...');
    }
    const config = config_1.getConfig(configPath);
    const fileList = utils_1.listFiles(config.root);
    const ruleDefinitions = rule_1.getRuleDefinitions(config);
    const ruleApplications = rule_1.getRuleApplications(config, ruleDefinitions);
    const filesToProcess = rule_1.filterFilesToProcess(config.root, fileList, ruleApplications);
    const filesData = processor_1.readFilesData(filesToProcess);
    const dependencies = dependencies_1.default(filesData, [config.root], config.extensions);
    const projectResult = processor_1.applyProjectRules(config.root, filesData, dependencies, ruleApplications);
    const logs = logger_1.compactProjectLogs(projectResult);
    if (reporter === types_1.Reporter.MOCHA) {
        logger_1.mochaLogger(logs);
    } else {
        logger_1.consoleLogger(logs);
    }
    const result = logger_1.getErrorCount(logs);
    if (!silent) {
        if (result === 0) {
            console.log('Stricter: No errors');
        } else {
            console.log(`Stricter: ${ result } error${ result > 1 ? 's' : '' }`);
        }
    }
    return result;
};
}
// stricter/config/index.js
_d78f.f[2] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const read_config_1 = _d78f.r(3);
const process_config_1 = _d78f.r(4);
const validate_config_1 = _d78f.r(5);
exports.getConfig = configPath => {
    const foundConfig = read_config_1.default(configPath);
    validate_config_1.default(foundConfig);
    const processedConfig = process_config_1.default(foundConfig);
    return processedConfig;
};
}
// stricter/config/read-config.js
_d78f.f[3] = function(module,exports){
var process = require('process');
Object.defineProperty(exports, '__esModule', { value: true });
const cosmiconfig = require('cosmiconfig');
const moduleName = 'stricter';
exports.default = configPath => {
    const explorer = cosmiconfig(moduleName, {
        configPath,
        sync: true,
        packageProp: false,
        rc: false,
        format: 'js'
    });
    const foundConfigData = explorer.load(process.cwd());
    return foundConfigData;
};
}
// stricter/config/process-config.js
_d78f.f[4] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
exports.getDirResolver = filepath => dir => path.resolve(path.dirname(filepath), dir);
exports.default = foundConfig => {
    const {config, filepath} = foundConfig;
    const resolveDir = exports.getDirResolver(filepath);
    const result = {
        root: resolveDir(config.root),
        rules: {}
    };
    if (config.rulesDir) {
        result.rulesDir = resolveDir(config.rulesDir);
    }
    if (config.rules) {
        result.rules = config.rules;
    }
    if (config.extensions) {
        result.extensions = config.extensions;
    }
    return result;
};
}
// stricter/config/validate-config.js
_d78f.f[5] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = foundConfig => {
    if (!foundConfig) {
        throw new Error('No config found');
    }
    if (!foundConfig.config) {
        throw new Error('No config contents found');
    }
    if (!foundConfig.config.root) {
        throw new Error('No root specified');
    }
};
}
// stricter/rule/index.js
_d78f.f[6] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
const utils_1 = _d78f.r(7);
const default_rules_1 = _d78f.r(8);
exports.defaultRules = { 'stricter/unused-files': default_rules_1.unusedFilesRule };
exports.RULE_SUFFIX = '.rule';
const stripOutSuffix = str => {
    return str.substring(0, str.length - exports.RULE_SUFFIX.length);
};
exports.getRuleDefinitions = config => {
    if (!config.rulesDir) {
        return exports.defaultRules;
    }
    const ruleFiles = utils_1.listFiles(config.rulesDir).filter(i => i.endsWith(`${ exports.RULE_SUFFIX }.js`));
    const customRules = ruleFiles.reduce((acc, filePath) => {
        const ruleName = path.basename(filePath, path.extname(filePath));
        const rule = _d78f.s(filePath);
        if (!rule.onProject) {
            throw new Error(`Rule ${ ruleName } should have onProject.`);
        }
        return Object.assign({}, acc, { [stripOutSuffix(ruleName)]: rule });
    }, {});
    return Object.assign({}, exports.defaultRules, customRules);
};
exports.getRuleApplications = (config, ruleDefinitions) => {
    const usages = Object.keys(config.rules);
    const notExistingRules = usages.filter(i => !ruleDefinitions[i]);
    if (notExistingRules.length) {
        throw new Error(`Unable to find definitions for following rules:\r\n${ notExistingRules.join('\r\n') }`);
    }
    const result = usages.reduce((acc, ruleName) => {
        return Object.assign({}, acc, {
            [ruleName]: {
                definition: ruleDefinitions[ruleName],
                usage: config.rules[ruleName]
            }
        });
    }, {});
    return result;
};
const getRuleUsages = ruleApplications => {
    return Object.values(ruleApplications).reduce((acc, i) => {
        if (Array.isArray(i.usage)) {
            return [
                ...acc,
                ...i.usage
            ];
        }
        return [
            ...acc,
            i.usage
        ];
    }, []);
};
const checkForMatch = (setting, filePath) => {
    if (typeof setting === 'function') {
        return setting(filePath);
    }
    const regexSetting = Array.isArray(setting) ? setting : [setting];
    return regexSetting.some(i => i.test(filePath));
};
exports.matchesRuleUsage = (directory, filePath, ruleUsage) => {
    const relativePath = filePath.replace(directory + path.sep, '');
    const matchesInclude = !ruleUsage.include || checkForMatch(ruleUsage.include, relativePath);
    const matchesExclude = ruleUsage.exclude && checkForMatch(ruleUsage.exclude, relativePath);
    return matchesInclude && !matchesExclude;
};
exports.filterFilesToProcess = (directory, files, ruleApplications) => {
    const ruleUsages = getRuleUsages(ruleApplications);
    const result = files.filter(i => ruleUsages.some(j => exports.matchesRuleUsage(directory, i, j)));
    return result;
};
}
// stricter/utils/index.js
_d78f.f[7] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const path = require('path');
const parser = require('babylon');
exports.readFile = i => fs.readFileSync(i, 'utf8');
exports.listFiles = directory => {
    const files = fs.statSync(directory).isDirectory() ? fs.readdirSync(directory).reduce((acc, f) => [
        ...acc,
        ...exports.listFiles(path.join(directory, f))
    ], []) : [directory];
    return files;
};
const defaultPlugins = [
    'flow',
    'jsx',
    'doExpressions',
    'objectRestSpread',
    'decorators',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'exportExtensions',
    'asyncGenerators',
    'functionBind',
    'functionSent',
    'dynamicImport',
    'numericSeparator',
    'optionalChaining',
    'importMeta',
    'bigInt',
    'optionalCatchBinding',
    'throwExpressions',
    'pipelineOperator',
    'nullishCoalescingOperator'
];
exports.parse = source => {
    const plugins = defaultPlugins;
    const result = parser.parse(source, {
        plugins,
        allowImportExportEverywhere: true,
        sourceType: 'script'
    });
    return result;
};
}
// stricter/rule/default-rules/index.js
_d78f.f[8] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const dfs = (stack, dependencies, seen) => {
    while (stack.length) {
        const fileName = stack.pop();
        seen[fileName] = true;
        if (dependencies[fileName]) {
            stack.push(...dependencies[fileName].filter(i => !seen[i]));
        }
    }
};
exports.unusedFilesRule = {
    onProject: ({config, dependencies, files}) => {
        if (!config || !config.entry || !Array.isArray(config.entry)) {
            return [];
        }
        const entries = config.entry;
        const related = config.relatedEntry || [];
        const fileList = Object.keys(files);
        const seen = {};
        const entryFiles = fileList.filter(i => checkForMatch(entries, i));
        dfs(entryFiles, dependencies, seen);
        const relatedFiles = fileList.filter(i => checkForMatch(related, i) && !seen[i]).filter(i => dependencies[i] && dependencies[i].some(j => seen[j]));
        dfs(relatedFiles, dependencies, seen);
        const unusedFiles = fileList.filter(i => !seen[i]);
        return unusedFiles;
    }
};
const checkForMatch = (setting, filePath) => {
    if (typeof setting === 'function') {
        return setting(filePath);
    }
    const regexSetting = Array.isArray(setting) ? setting : [setting];
    return regexSetting.some(i => i.test(filePath));
};
}
// stricter/processor/index.js
_d78f.f[9] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = _d78f.r(7);
const rule_1 = _d78f.r(6);
const types_1 = _d78f.r(10);
const readFileData = filePath => {
    const source = utils_1.readFile(filePath);
    const ast = filePath.endsWith('.js') ? () => utils_1.parse(source) : undefined;
    return {
        [filePath]: Object.freeze({
            source,
            ast
        })
    };
};
exports.readFilesData = files => {
    const result = Object.freeze(files.reduce((acc, filePath) => {
        return Object.assign({}, acc, readFileData(filePath));
    }, {}));
    return result;
};
const createRuleApplicationResult = (messageType, ruleMessages) => {
    let result;
    switch (messageType) {
    case types_1.Level.ERROR:
        result = { errors: ruleMessages };
        break;
    case types_1.Level.OFF:
        result = { errors: [] };
        break;
    case types_1.Level.WARNING:
    default:
        result = { warnings: ruleMessages };
    }
    return result;
};
const processRule = (directory, definition, ruleUsage, filesData, dependencies) => {
    const reducedFilesData = Object.freeze(Object.keys(filesData).filter(i => rule_1.matchesRuleUsage(directory, i, ruleUsage)).reduce((acc, fileName) => Object.assign({}, acc, { [fileName]: filesData[fileName] }), {}));
    const ruleMessages = definition.onProject({
        dependencies,
        config: ruleUsage.config,
        files: reducedFilesData,
        rootPath: directory
    });
    let messageType = ruleUsage.level;
    if (!messageType || Object.values(types_1.Level).indexOf(messageType) === -1) {
        messageType = types_1.Level.WARNING;
    }
    const ruleApplicationResult = createRuleApplicationResult(messageType, ruleMessages);
    return ruleApplicationResult;
};
exports.applyProjectRules = (directory, filesData, dependencies, ruleApplications) => {
    const result = Object.entries(ruleApplications).reduce((acc, [ruleName, ruleApplication]) => {
        const usage = Array.isArray(ruleApplication.usage) ? ruleApplication.usage : [ruleApplication.usage];
        const definition = ruleApplication.definition;
        let ruleApplicationResult;
        ruleApplicationResult = usage.map(usage => processRule(directory, definition, usage, filesData, dependencies)).reduce((acc, i) => ({
            errors: [
                ...acc.errors || [],
                ...i.errors || []
            ],
            warnings: [
                ...acc.warnings || [],
                ...i.warnings || []
            ]
        }), {
            errors: [],
            warnings: []
        });
        return Object.assign({}, acc, { [ruleName]: ruleApplicationResult });
    }, {});
    return result;
};
}
// stricter/types/index.js
_d78f.f[10] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
var Level;
(function (Level) {
    Level['WARNING'] = 'warning';
    Level['ERROR'] = 'error';
    Level['OFF'] = 'off';
}(Level = exports.Level || (exports.Level = {})));
var Reporter;
(function (Reporter) {
    Reporter['CONSOLE'] = 'console';
    Reporter['MOCHA'] = 'mocha';
}(Reporter = exports.Reporter || (exports.Reporter = {})));
}
// stricter/dependencies/index.js
_d78f.f[11] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const extract_path_1 = _d78f.r(12);
const parse_imports_1 = _d78f.r(14);
exports.default = (filesData, root, extensions) => {
    const result = Object.entries(filesData).reduce((acc, [filePath, data]) => {
        if (!data.ast) {
            return acc;
        }
        const imports = parse_imports_1.default(data.ast());
        const dependencies = [
            ...imports.staticImports,
            ...imports.dynamicImports
        ].map(i => extract_path_1.default(i, filePath, root, extensions));
        return Object.assign({}, acc, { [filePath]: dependencies });
    }, {});
    return result;
};
}
// stricter/dependencies/extract-path.js
_d78f.f[12] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
const resolve_import_1 = _d78f.r(13);
exports.default = (importString, filePath, resolveRoots, extensions) => {
    const potentialImportPaths = importString.startsWith('.') ? [path.resolve(filePath, '..', importString)] : resolveRoots.map(i => path.resolve(i, importString));
    const result = resolve_import_1.default(potentialImportPaths, extensions) || importString;
    return result;
};
}
// stricter/dependencies/resolve-import.js
_d78f.f[13] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const path = require('path');
exports.default = (potentialImportPaths, extensions) => {
    const extensionsToAdd = [
        'js',
        ...extensions || []
    ];
    const result = potentialImportPaths.reduce((acc, importPath) => [
        ...acc,
        path.join(importPath, 'index.js'),
        ...extensionsToAdd.map(i => `${ importPath }.${ i }`),
        importPath
    ], []).find(i => fs.existsSync(i) && !fs.lstatSync(i).isDirectory());
    return result;
};
}
// stricter/dependencies/parse-imports.js
_d78f.f[14] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const babylon_walk_1 = require('babylon-walk');
exports.default = ast => {
    const state = {
        dynamicImports: [],
        staticImports: []
    };
    babylon_walk_1.simple(ast, {
        ImportDeclaration(node, state) {
            state.staticImports.push(node.source.value);
        },
        ExportNamedDeclaration(node, state) {
            if (node.source) {
                state.staticImports.push(node.source.value);
            }
        },
        ExportAllDeclaration(node, state) {
            if (node.source) {
                state.staticImports.push(node.source.value);
            }
        },
        CallExpression(node, state) {
            const callee = node.callee;
            if (callee && (callee.type === 'Import' || callee.type === 'Identifier' && callee.name === 'require') && node.arguments && node.arguments.length > 0 && node.arguments[0].type === 'StringLiteral') {
                state.dynamicImports.push(node.arguments[0].value);
            }
        }
    }, state);
    return state;
};
}
// stricter/logger/index.js
_d78f.f[15] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
var console_1 = _d78f.r(16);
exports.consoleLogger = console_1.default;
var mocha_1 = _d78f.r(17);
exports.mochaLogger = mocha_1.default;
var flatten_1 = _d78f.r(18);
exports.compactProjectLogs = flatten_1.compactProjectLogs;
exports.getErrorCount = projectLogs => Object.values(projectLogs).reduce((acc, i) => acc + (i.errors && i.errors.length || 0), 0);
}
// stricter/logger/console.js
_d78f.f[16] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const chalk_1 = require('chalk');
exports.default = logs => {
    if (!logs.length) {
        return;
    }
    console.log(chalk_1.default.bgBlackBright('Project'));
    logs.forEach(log => {
        if (log.warnings) {
            log.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow('warning: ') + chalk_1.default.gray(log.rule) + ' ' + warning);
            });
        }
        if (log.errors) {
            log.errors.forEach(error => {
                console.log(chalk_1.default.red('error: ') + chalk_1.default.gray(log.rule) + ' ' + error);
            });
        }
    });
};
}
// stricter/logger/mocha.js
_d78f.f[17] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const reportFileName = 'stricter.json';
const encode = str => {
    const substitutions = {
        '&:': '&amp;',
        '"': '&quot;',
        '\'': '&apos;',
        '<': '&lt;',
        '>': '&gt;'
    };
    const result = Object.entries(substitutions).reduce((acc, [original, substitution]) => {
        return acc.replace(new RegExp(original, 'g'), substitution);
    }, str);
    return result;
};
exports.default = logs => {
    const now = new Date();
    const failuresCount = logs.reduce((acc, i) => acc + (i.errors && i.errors.length || 0), 0);
    const report = {
        stats: {
            tests: failuresCount,
            passes: 0,
            failures: failuresCount,
            duration: 0,
            start: now,
            end: now
        },
        failures: logs.map(log => ({
            title: log.rule,
            fullTitle: log.rule,
            duration: 0,
            errorCount: log.errors && log.errors.length || 0,
            error: log.errors && log.errors.map(i => encode(i)).join('\n')
        })),
        passes: [],
        skipped: []
    };
    fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2), 'utf-8');
};
}
// stricter/logger/flatten.js
_d78f.f[18] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.compactProjectLogs = projectResult => {
    const result = Object.entries(projectResult).map(([rule, applicationResult]) => ({
        rule,
        errors: applicationResult.errors,
        warnings: applicationResult.warnings
    })).filter(i => i.warnings && i.warnings.length || i.errors && i.errors.length);
    return result;
};
}
// stricter/cli.js
_d78f.f[19] = function(module,exports){
var process = require('process');
Object.defineProperty(exports, '__esModule', { value: true });
const program = require('commander');
const isCi = require('is-ci');
const stricter_1 = _d78f.r(1);
exports.default = () => {
    program.version('0.0.12').option('-c, --config <path>', 'specify config location').option('-r, --reporter <console|mocha>', 'specify reporter', /^(console|mocha)$/i, 'console').parse(process.argv);
    const result = stricter_1.default({
        configPath: program.config,
        reporter: program.reporter,
        silent: isCi
    });
    return result;
};
}
module.exports = _d78f.r(0)