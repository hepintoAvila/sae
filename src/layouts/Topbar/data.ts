import { ProfileOption } from './types';


// get the profilemenu
const profileMenus: ProfileOption[] = [
	{
		label: 'Salir',
		icon: 'mdi mdi-logout',
		redirectTo: '/account/logout',
	},
];


export { profileMenus };
