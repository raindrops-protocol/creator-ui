import React from "react";

import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";

import { Wizard } from ".";
import { RadioInput, IntegerInput, PublicKeyInput } from "./Inputs";
import { SubStepProps } from "./FormStep";
import { Form, FormikSubmitButton } from "./Form";

export default {
  title: "Wizard",
  component: Wizard,
};

const TeaPreference = ({ data, handleSubmit }: SubStepProps) => {
  enum TFN {
    true = "true",
    false = "false",
    null = "null",
  }
  const schema = yup.object({
    likesTea: yup.string().required().oneOf(Object.values(TFN)),
  });
  type TValues = yup.InferType<typeof schema>;
  return (
    <Formik
      initialValues={{ likesTea: data?.likesTea }}
      onSubmit={(values: TValues, actions: FormikHelpers<TValues>) => {
        actions.setSubmitting(true);
        handleSubmit(values);
        actions.setSubmitting(false);
      }}
      validationSchema={schema}
    >
      {(props) => (
        <Form onSubmit={props.handleSubmit}>
          <RadioInput.Inline
            name="likesTea"
            title="Do you drink tea?"
            help="Tea is a beverage that may be drunk either hot or cold"
            options={[
              { title: "Yes", value: TFN.true },
              { title: "No", value: TFN.false },
              { title: "Meh", value: TFN.null },
            ]}
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.likesTea}
            error={props.errors.likesTea}
          />
          <FormikSubmitButton>Next</FormikSubmitButton>
        </Form>
      )}
    </Formik>
  );
};

const NumberOfCups = ({ handleSubmit, data }: SubStepProps) => {
  const schema = yup.object({
    numCups: yup.number().integer().required().max(12, "That's too much tea!"),
  });
  type TValues = yup.InferType<typeof schema>;
  const submit = (values: TValues) => {
    handleSubmit({
      numCups: values.numCups,
      cups: Array(values.numCups).fill({}),
    });
  };
  return (
    <Formik
      initialValues={{ numCups: data?.numCups }}
      onSubmit={(values: TValues, actions: FormikHelpers<TValues>) => {
        actions.setSubmitting(true);
        submit(values);
        actions.setSubmitting(false);
      }}
      validationSchema={schema}
    >
      {(props) => (
        <Form onSubmit={props.handleSubmit}>
          <IntegerInput.Inline
            name="numCups"
            title="How many cups do you drink a day?"
            max={12}
            endEnhancer="cups"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.numCups}
            error={props.errors.numCups}
          />
          <FormikSubmitButton>Next</FormikSubmitButton>
        </Form>
      )}
    </Formik>
  );
};

type CupDetailsProps = { cupNum: number };

const CupDetails = ({
  handleSubmit: submit,
  data,
  cupNum,
}: CupDetailsProps & SubStepProps) => {
  const handleSubmit = (temperature: string) => {
    const updatedCups = data.cups;
    updatedCups[cupNum] = { temperature };
    submit({ cups: updatedCups });
  };

  return (
    <RadioInput.Standalone
      title={`How do you take cup of tea no. ${cupNum + 1}?`}
      options={[
        { title: "Normal", value: "hot" },
        { title: "Iced", value: "cold" },
      ]}
      onSelect={handleSubmit}
      value={data?.cups[cupNum]?.temperature}
    />
  );
};

const SendReward = ({ handleSubmit, data }: SubStepProps) => {
  const schema = yup.object({
    wallet: PublicKeyInput.validation.required(),
  });
  type TValues = yup.InferType<typeof schema>;
  return (
    <Formik
      initialValues={{
        wallet: data?.wallet,
      }}
      validationSchema={schema}
      onSubmit={(values: TValues, actions: FormikHelpers<TValues>) => {
        actions.setSubmitting(true);
        handleSubmit(values);
        actions.setSubmitting(false);
      }}
    >
      {(props) => (
        <Form onSubmit={props.handleSubmit}>
          <PublicKeyInput.Formik
            name="wallet"
            title="What's your wallet address?"
            help="Enter your public key here for a free cup of tea"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.wallet}
            error={props.errors.wallet}
          />
          <FormikSubmitButton>Complete</FormikSubmitButton>
        </Form>
      )}
    </Formik>
  );
};

export const SteppedForm = () => {
  const [data, setData] = React.useState<any>({});
  const printData = () => console.log({ data });
  return (
    <Wizard onComplete={printData} values={data} setValues={setData}>
      <Wizard.Step
        title="Tea Preference"
        hash="likes-tea"
        Component={TeaPreference}
      />
      {data?.likesTea ? (
        <Wizard.Step
          title="How many?"
          hash="num-cups"
          Component={NumberOfCups}
        />
      ) : null}
      {data?.likesTea &&
        data?.cups?.map((_: any, index: number) => (
          <Wizard.Step<CupDetailsProps>
            title={`Cup of tea #${index + 1}`}
            hash={`cup-details-${index}`}
            key={`cup_${index}`}
            Component={CupDetails}
            cupNum={index}
          />
        ))}
      <Wizard.Step
        title="Reward Address"
        hash="send-reward"
        Component={SendReward}
      />
    </Wizard>
  );
};
