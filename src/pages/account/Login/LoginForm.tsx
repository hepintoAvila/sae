import { Form, TextInput, PasswordInput, CheckInput } from '@/components';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginFormSchema } from './useLogin';

type LoginFormProps = {
  onSubmit: (data: any) => void;
  loading: boolean;
};

const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
  const { t } = useTranslation();

  return (
    <Form
      onSubmit={onSubmit}
      schema={loginFormSchema}
      defaultValues={{ 
        login: 'nomuser@unicesar.edu.co', 
        password: '123' 
      }}
    >
      <TextInput
        label={t('Email Address')}
        type="text"
        name="login"
        placeholder={t('Enter your email')}
        containerClass="mb-3"
      />
      
      <PasswordInput
        label={t('Password')}
        name="password"
        placeholder={t('Enter your password')}
        containerClass="mb-3"
      >
        <Link to="/account/RecoverPassword2" className="text-muted float-end">
          <small>{t('Forgot your password?')}</small>
        </Link>
      </PasswordInput>
      
      <CheckInput
        name="checkbox-signin"
        type="checkbox"
        label={t('Remeber me')}
        containerClass="mb-3"
        defaultChecked
      />
      
      <div className="d-grid mb-0 text-center">
        <Button variant="primary" type="submit" disabled={loading}>
          <i className="mdi mdi-login"></i> {t('Log In')}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;