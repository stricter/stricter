import type { RuleDefinitions } from './../types';

export const filterRuleDefinitions = (
    rules: RuleDefinitions,
    filter: string[] | undefined,
): RuleDefinitions => {
    if (!filter) {
        return rules;
    }

    const result = Object.entries(rules)
        .filter(([ruleName]) => filter.includes(ruleName))
        .reduce((acc, [ruleName, ruleDefinition]) => {
            acc[ruleName] = ruleDefinition;
            return acc;
        }, {} as RuleDefinitions);

    return result;
};
