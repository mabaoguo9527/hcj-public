import type { Api, Model, ProviderId } from "@earendil-works/pi-ai";
import values from "./deepseek.json" with { type: "json" };

// 以下拷贝自 pi-ai 内部 dist/model-catalog.ts（非公开 API，无法从包导入）
type ModelGroups = Record<string, Record<string, object>>;
type ModelId<TGroups extends ModelGroups> = {
	[TApi in keyof TGroups]: keyof TGroups[TApi];
}[keyof TGroups] & string;
type ModelApi<TGroups extends ModelGroups, TModelId extends ModelId<TGroups>> = {
	[TApi in keyof TGroups]: TModelId extends keyof TGroups[TApi] ? TApi : never;
}[keyof TGroups] & Api;

export type ModelCatalog<TGroups extends ModelGroups, TProvider extends ProviderId> = {
	[TModelId in ModelId<TGroups>]: Model<ModelApi<TGroups, TModelId>> & {
		id: TModelId;
		provider: TProvider;
	};
};

function flattenModelCatalog<const TProvider extends ProviderId, const TGroups extends ModelGroups>(
	_provider: TProvider,
	groups: TGroups,
): ModelCatalog<TGroups, TProvider> {
	return Object.assign({}, ...Object.values(groups));
}
// --------------------------------------------------------------------------------------------------------------


console.log(values)
console.log(typeof values)
type Values = typeof values;
type modelId = ModelId<Values>;

export const DEEPSEEK_MODELS: ModelCatalog<typeof values, "deepseek"> =
	flattenModelCatalog("deepseek", values);
console.log('DEEPSEEK_MODELS:', DEEPSEEK_MODELS)
console.log('deepseek-v4-flash:', DEEPSEEK_MODELS["deepseek-v4-flash"])