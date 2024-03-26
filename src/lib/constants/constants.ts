class Constants {
	development = {
		status: 'gamma',
		dates: {
			start: '2021',
		}
	}
	keys = {
		public: {
			supabase: {
				sbUrlPublic: 'https://tdoulxkicweqdvxnuqmm.supabase.co',
				sbKeyPublic: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A'
			}
		}
	}
}

const constants = new Constants()

export {
	constants
}