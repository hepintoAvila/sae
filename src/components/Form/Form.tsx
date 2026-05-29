import { yupResolver } from '@hookform/resolvers/yup';
import { Form as BSForm } from 'react-bootstrap';
import { useForm, FormProvider, DefaultValues, FieldValues, SubmitHandler } from 'react-hook-form';
import { CSSProperties, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

type FormProps<TFormValues extends FieldValues> = {
  id?: string;
  name?: string;
  schema?: ObjectSchema<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  children: ReactNode;
  defaultValues?: DefaultValues<TFormValues>;
  className?: string;
  styles?: CSSProperties;
};

const Form = <TFormValues extends Record<string, any> = Record<string, any>>({
  schema,
  onSubmit,
  children,
  defaultValues,
  ...props
}: FormProps<TFormValues>) => {
  const methods = useForm<TFormValues>({
    // @ts-ignore
    resolver: schema != null ? yupResolver<TFormValues>(schema) : undefined,
    defaultValues,
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <BSForm onSubmit={methods.handleSubmit(onSubmit)} {...props}>
        {children}
      </BSForm>
    </FormProvider>
  );
};

export default Form;
