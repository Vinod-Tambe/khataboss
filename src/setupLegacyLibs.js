/**
 * daterangepicker (UMD) reads global moment/jQuery when bundled by Vite.
 * Without this, opening Daybook throws "moment is not a function" and the app goes blank.
 */
import $ from 'jquery';
import moment from 'moment';

const momentFn = typeof moment === 'function' ? moment : moment?.default;

if (typeof window !== 'undefined') {
  window.$ = window.jQuery = $;
  if (momentFn) {
    window.moment = momentFn;
  }
}
