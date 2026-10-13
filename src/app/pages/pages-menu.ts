// Demo menu: only Reportes dosimetría
import { MenuItem } from './menu-item';

export const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Reportes dosimetría',
    icon: 'fa fa-file-text-o fa-sm',
    link: '/pages/dosimetria/reportes-dosimetria',
    home: true,
    key: 'reportesdosimetria',
    permisos: [1, 2, 12],
  },
];
