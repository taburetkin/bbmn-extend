const ModelSchemas = bbmn.components.ModelSchemas;
const Model = Backbone.Model;
const ButtonMixin = bbmn.mixins.controls.button;
const PromiseBarMixin = bbmn.mixins.controls.promiseBar;
const CssClassModifiersMixin = bbmn.mixins.view.cssClassModifiers;
const ControlViewMixin = bbmn.mixins.controls.controlView;
const EditModelMixin = bbmn.mixins.controls.editSchema.Model;
const EditPropertyMixin = bbmn.mixins.controls.editSchema.Property;
const InputMixin = bbmn.mixins.controls.input;
const mix = bbmn.utils.mix;
const buildViewByKey = bbmn.utils.buildViewByKey;
const nextCollectionView = bbmn.mixins.collectionView.nextCollectionView;

const CollectionView = nextCollectionView(Mn.CollectionView);

//here we defining our model
const RegisterModel = Model.extend({
  urlRoot:'http://someApiServer.com/register'
});

//now, we supply schema for our model
ModelSchemas.initialize(RegisterModel, {
  login:{
    validation: {      
      email: true,
      required: true,
    },
    display:{
      label: 'enter your login',
    },
    value:{
			type:'email',
			inputType:'email',
		},
  },
  password: {
    validation: {
      minLength: 6,      
    },
    display: {
      label: 'enter your password'
    },
		value:{
			type:'text',
			inputType:'password',
		},
  },
  passwordConfirm: {
    validation: {
      shouldBeEqual: values => values && values.password
    },
    display: {
      label: 'enter your password again'
    },
    value:{
			type:'text',
			inputType:'password',
		},
  }
});




//this is a simple button view
const Button = mix(CollectionView).with(ButtonMixin);

//this is a promise bar component for our controls
const PromiseBar = mix(CollectionView).with(PromiseBarMixin).extend({
  buttonView: Button
});

//this is a validation ErrorView
const ErrorView = mix(Mn.View).with(CssClassModifiersMixin).extend({
	className:'control-validate-wrapper',
	cssClassModifiers:[
		(m,v) => v.errorMessage ? 'error' : ''
	],
	getTemplate(){		
		return () => this.errorMessage;
	},
	showError(error){
		if(_.isArray(error)){
			error = error.join(', ').trim();
		}
		this.errorMessage = error;
		this.render();
	},
	hideError(){
		this.errorMessage = '';
		this.render();
	}
});


// this is main wrapper for all viewControls
const ControlView = ControlViewMixin(CollectionView).extend({
	renderAllCustoms: true,
	buttonsView: PromiseBar,
	textView: Mn.View,
	errorView: ErrorView,
	fixButton(btn){
		if (btn.name != btn.text) { return btn; }

		if (btn.text === 'rejectSoft') {
			btn.text = 'cancel';
		}
		return btn;
	}
});

const BaseInput = InputMixin(Mn.View);

const Input = ControlView.extend({
  className:'control-input 2',
	controlView: BaseInput,
	controlViewOptions(){
		let inputAttributes = this.getOption('inputAttributes');

		let options = {
			valueOptions: this.getOption('valueOptions')
		};
		if (inputAttributes) {
			options.attributes = inputAttributes;			
		}

		return options;
	},
});

const EditProperty = EditPropertyMixin(ControlView).extend({
  getControlView(){

	let View = Input;
	let schema = this.getSchema();
	let options = { 
		value: this.getControlValue(),
		valueOptions: schema.getType(),
		inputAttributes:{
			name: schema.name,
		},
	};        
	return new View(options);
  },
  getValidateRule(){
	if (!this._validateRule) {
		let schema = this.getSchema();
		this._validateRule = _.extend({}, schema.getType(), schema.getValidation());
	}
	return this._validateRule;
  },
});

const EditModel = EditModelMixin(ControlView).extend({
  editPropertyClass: EditProperty
});

let test = new EditModel({
  validateOnReady: true,
  propertyLabelAsHeader: true,

  cssClassModifiers: ['big register'],

  schema: ModelSchemas.get(RegisterModel),
  buttons: [{name:'resolve', text:'sign in'}],
  value: {},
  onResolve: values => console.log('submit:', values)
});

test.$el.appendTo($('body'));
test.render();

console.log(test)
