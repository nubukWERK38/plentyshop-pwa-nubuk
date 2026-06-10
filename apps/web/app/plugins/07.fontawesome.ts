import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

// Solid icons
import {
  faArrowRight,
  faArrowLeft,
  faChevronRight,
  faChevronLeft,
  faChevronUp,
  faChevronDown,
  faCheck,
  faXmark,
  faSearch,
  faShoppingCart,
  faHeart,
  faUser,
  faBars,
  faPlus,
  faMinus,
  faStar,
  faStarHalfAlt,
  faCircleNotch,
  faTrash,
  faPen,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faHome,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faFacebookF,
  faInstagram,
  faArrowRight,
  faArrowLeft,
  faChevronRight,
  faChevronLeft,
  faChevronUp,
  faChevronDown,
  faCheck,
  faXmark,
  faSearch,
  faShoppingCart,
  faHeart,
  faUser,
  faBars,
  faPlus,
  faMinus,
  faStar,
  faStarHalfAlt,
  faCircleNotch,
  faTrash,
  faPen,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faHome,
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon);
});
