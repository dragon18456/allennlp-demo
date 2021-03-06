import { createContext } from 'react';
import { Model } from '@allenai/tugboat/lib';

import { ModelInfo } from '../lib';

export class ModelInfoForModelNotFoundError extends Error {
    constructor(modelId: string) {
        super(`No model info for model with id ${modelId}.`);
    }
}

export const ModelInfoList = createContext<ModelInfo[]>([]);

export function findModelInfo(modelInfoList: ModelInfo[], selectedModel: Model): ModelInfo {
    const info = modelInfoList.find((i) => i.id === selectedModel?.id);
    if (!info) {
        throw new ModelInfoForModelNotFoundError(selectedModel.id);
    }
    return info;
}
