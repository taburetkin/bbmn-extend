import mix from '../../utils/mix/index.js';
import getOption from '../../mixins/common/get-option/index.js';

const Base = mix(function Schema(){}).with(getOption);
export default Base;
