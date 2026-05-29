  type AppConfig = {
  Nom: string;
  Email: string;
  Rol: string;
  status: string;
  AppKey: string;
  dependencia_id: string;
}
export default function getUserFromSession(){
      const userData = localStorage.getItem('userData');
	    let appConfig: AppConfig  = userData ? JSON.parse(userData) : [];
    return appConfig;
  };

  