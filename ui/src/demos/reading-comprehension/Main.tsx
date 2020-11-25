/*
    Note: this file is in development and should only be viewed as example code direction
*/

import React from 'react';
import { Divider, Select } from 'antd';
import { Content } from '@allenai/varnish/components';

import { Form, Title, Description, Markdown, RunButton, Loading } from '../../tugboat';
import { ModelUsageModal, ModelCardModal } from '../../components';
import { useModels, Model } from '../../lib';
import { config } from './config';

interface Input {
    passage: string;
    question: string;
}

interface BiDAFOutput {
    best_span: number[];
    best_span_str: string;
    passage_question_attention: number[][];
    passage_tokens: string[];
    question_tokens: string[];
    span_end_logits: number[];
    span_end_probs: number[];
    span_start_logits: number[];
    span_start_probs: number[];
    token_offsets: number[][];
}

interface TransformerQAOutput {
    best_span: number[];
    best_span_scores: number;
    best_span_str: string;
    context_tokens: string[];
    id: string;
    span_end_logits: number[];
    span_start_logits: number[];
}

// TODO: Figure out what other types exist
enum NAQANetAnswerType {
    PassageSpan = 'passage_span',
}

interface NAQANetOutput {
    answer: {
        'answer-type': NAQANetAnswerType;
        spans: number[];
        value: string;
    };
    loss: number;
    passage_question_attention: number[][];
    passage_tokens: string[];
    /* NOTE: This might be "None", which is Python's equivalent for undefined / null. There's
     * some errant serialization in the backend that should in the long run be fixed to correct
     * this.
     */
    question_id: string;
    question_tokens: string[];
}

type Output = BiDAFOutput | TransformerQAOutput | NAQANetOutput;

export const Main = () => {
    // TODO: NMN doesn't return anything right now (there's no `/info` route, I think), so it's
    // not present. We need to fix this.
    const models = useModels<Input, Output>(
        'bidaf-elmo',
        'bidaf',
        'nmn',
        'transformer-qa',
        'naqanet'
    );
    const [selectedModel, setSelectedModel] = React.useState<Model<Input, Output>>();
    const [output, setOutput] = React.useState<Output>();

    React.useEffect(() => {
        if (models && models.length > 0 && selectedModel === undefined) {
            // TODO: The Output type is generic, and captures all types that might be returned,
            // as each model's output is similar but a little different. In the future when we
            // wire up a display that isn't dumping JSON to the screen we'll want to cast the
            // output somehow to the type we expect. To handle this I'd suggest using TypeScript's
            // relative newish user-defined type guards:
            // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
            setSelectedModel(models[0]);
        }
    });

    if (!models) {
        return (
            <Content>
                <Loading />
            </Content>
        );
    }

    let input: Input | undefined;
    const handleFormSubmit = async (i: Input) => {
        // TODO: Show some form of loading.
        // TODO: Implement better error handling (show something nice to the user).
        if (!selectedModel) {
            console.error(`Attempt to submit without a selected model. This shouldn't happen.`);
            return;
        }
        input = i;
        try {
            const p = await selectedModel.predict(i);
            if (input !== p.input) {
                console.warn('Disregarding stale prediction:', p);
                return;
            }
            setOutput(p.output);
        } catch (err) {
            // TODO: Implement better error handling (show something nice to the user).
            console.error(err);
        }
    };

    return (
        <Content>
            <Title>{config.title}</Title>
            <Description>
                <Markdown>
                    Reading comprehension is the task of answering questions about a passage of text
                    to show that the system understands the passage.
                </Markdown>
            </Description>
            <Form.Field label="Model">
                <Form.Select
                    value={selectedModel ? selectedModel.info.id : undefined}
                    onChange={(mid: string) => {
                        const m = models.find((m) => m.info.id === mid);
                        if (!m) {
                            console.error(new Error(`Invalid model id: ${mid}`));
                            return;
                        }
                        setSelectedModel(m);
                    }}
                    dropdownMatchSelectWidth={false}
                    optionLabelProp="label"
                    listHeight={370}>
                    {models.map((m) =>
                        m.info.model_card_data ? (
                            <Select.Option
                                key={m.info.id}
                                value={m.info.id}
                                label={m.info.model_card_data.display_name}>
                                <b>{m.info.model_card_data.display_name}</b>
                                <Markdown>{m.info.model_card_data.description}</Markdown>
                            </Select.Option>
                        ) : null
                    )}
                </Form.Select>
            </Form.Field>
            <Form onFinish={handleFormSubmit}>
                {selectedModel && selectedModel.info.model_card_data ? (
                    <>
                        <Markdown>{selectedModel.info.model_card_data.description}</Markdown>
                        <ModelUsageModal model={selectedModel.info} />
                        <ModelCardModal model={selectedModel.info} />
                    </>
                ) : null}
                <Form.Field label="Select an Example">
                    <Form.Select placeholder="Examples..." />
                </Form.Field>
                <Form.Field
                    label="Passage"
                    name="passage"
                    rules={[{ required: true }]}
                    tooltip="Some text that the model should use to try and answer the question.">
                    <Form.TextArea />
                </Form.Field>
                <Form.Field
                    label="Question"
                    name="question"
                    rules={[{ required: true }]}
                    tooltip="The question the model should attempt to answer using the input passage.">
                    <Form.Input />
                </Form.Field>
                <Form.Field>
                    {/* TODO: Consider <Form.Submit>Run Model</Form.Submit>? */}
                    <RunButton>Run Model</RunButton>
                </Form.Field>
            </Form>
            <Divider />
            {output ? (
                <code>
                    <pre>{JSON.stringify(output, null, 2)}</pre>
                </code>
            ) : null}
        </Content>
    );
};
