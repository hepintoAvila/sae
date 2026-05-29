
//import encodeBasicUrl from "./encodeBasicUrl";

type SendDataParams<T> = {
    values?: any;
    option?: any;
    accion?: any;
    setLoading: (loading: boolean) => void;
    setItems: (items: T[]) => void;
    navigate: (url: string) => void;
    redirectUrl?: string;
    showNotification: (notification: { message: string; type: string }) => void;
};

const sendData = async <T>({
    values,
    option,
    accion,
    setLoading,
    setItems,
    navigate,
    redirectUrl,
    showNotification,
}: SendDataParams<T>) => {
/*
    const ErrorCodeMessages: { [key: number]: string } = {
    401: 'Invalid credentials',
    403: 'Access Forbidden',
    404: 'Resource or page not found',
    }; 

    try {
        setLoading(true);
        const url = `&accion=${encodeBasicUrl(accion)}&opcion=${encodeBasicUrl(option)}&bonjour=oui`;
        const profesionalApi = AdministradorService(url);
        const response = (await profesionalApi.Save(values)) as unknown as any;

        if (response?.status === 202) {
            setTimeout(() => {
                const data = response?.data;
                showNotification({ message: response?.message, type: response?.type });
                setItems(data);
                if (redirectUrl) {
                    navigate(redirectUrl);
                }
            }, 1000);
        } else {
            const errorCode = response.status;
            const errorMessage = ErrorCodeMessages[errorCode] || response?.data?.message;
            showNotification({ message: errorMessage, type: 'error' });
        }
    } catch (error: any) {
        showNotification({ message: error.toString(), type: 'error' });
    } finally {
        setLoading(false);
    }
    */
};

export default sendData;