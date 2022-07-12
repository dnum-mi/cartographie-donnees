import PropTypes from "prop-types";


export const commonPropTypes = {
  attributeId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  editMode: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.any,
};

export const textPropTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  headingLevel: PropTypes.number,
  editionPlaceholder: PropTypes.string,
  hasSuffixValue: PropTypes.bool,
  inputType: PropTypes.string,
  suffixAttributeId: PropTypes.string,
  suffixEditionPlaceholder: PropTypes.string,
  suffixAttributeLabel: PropTypes.string,
  suffixValue: PropTypes.string,
  isTextArea: PropTypes.bool,
}

export const tagPropTypes = {
  tagMode: PropTypes.oneOf([
    'simple', 'multiple',
  ]).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  tagCategory: PropTypes.string,
  title: PropTypes.string,
  tagColor: PropTypes.string,
}

export const booleanPropTypes = {
  value: PropTypes.bool,
}
