import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Negation',
    order: 1,
    modelIds: [ModelId.ELMONER, ModelId.FineGrainedNER],
    status: 'active',
    taskId: 'ner',
};
