export let validation = new JustValidate('.form');

validation
	.addField('#name', [
		{
			rule: 'minLength',
			value: 3,
		},
		{
			rule: 'maxLength',
			value: 30,
		},
	])
	.addField('#email', [
		{
			rule: 'required',
			errorMessage: 'Email is required',
		},
		{
			rule: 'email',
			errorMessage: 'Email is invalid!',
		},
	]);
