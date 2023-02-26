import './install-prompt';
import { fetchDataSvc } from './data';
import { checkOnline } from './connectivity';

fetchDataSvc.init();
checkOnline();
