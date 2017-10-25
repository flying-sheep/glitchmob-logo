const { sqrt } = Math;
let container;

const get_dims = () => ({
	unit: Math.min(container.offsetWidth, container.offsetHeight) / 3,
	width: container.offsetWidth,
	height: container.offsetHeight
});

function get_hash_params() {
	const hash_re = /([^&;=]+)=?([^&;]*)/g;
	const d = s => decodeURIComponent(s.replace(/\+/g, " "));
	const q = window.location.hash.substring(1);

	const params = {};
	let e;
	while (e = hash_re.exec(q)) params[d(e[1])] = d(e[2]);

	return params;
}

const Logo = ({ unit: u, width, height, thickness, foreground, background }) => {
	// 3 points: A, B, C and the middles between them (AB, BC, AC)
	const h = sqrt(3) * u / 2;
	// coords for midpoints (inverted triangle)
	const ab = { x: -.5 * u, y: 0 };
	const ca = { x: .5 * u, y: 0 };
	const bc = { x: 0, y: -h
		// coords for tips (upright larger triangle)
	};const a = { x: 0, y: h };
	const b = { x: -u, y: -h };
	const c = { x: u, y: -h };

	return React.createElement(
		"svg",
		{
			viewBox: `${-width / 2} -${height / 2} ${width} ${height}`,
			preserveAspectRatio: "xMaxYMax",
			style: {
				'--thickness': thickness,
				'--foreground': foreground,
				'--background': background
			}
		},
		React.createElement("circle", { r: u, cx: ab.x, cy: "0" }),
		React.createElement("circle", { r: u, cx: ca.x, cy: "0" }),
		"// inverted smaller triangle",
		React.createElement("path", { d: `
      M ${ab.x} ${-ab.y}
			L ${bc.x} ${-bc.y}
      L ${ca.x} ${-ca.y}
			Z
		` }),
		"// upright larger triangle",
		React.createElement("path", { d: `
      M ${a.x} ${-a.y}
			L ${b.x} ${-b.y}
      L ${c.x} ${-c.y}
			Z
		` })
	);
};

const defaults = {
	thickness: '1',
	foreground: '#000000',
	background: '#ffffff'
};

class ReactiveLogo extends React.Component {
	constructor(props) {
		super(props);
		window.addEventListener('resize', () => this.setState(get_dims()));
		this.state = { ...get_dims(), ...defaults, ...get_hash_params() };
		this.set_hash();
	}
	set_css() {
		const state = {
			thickness: this.refs.thickness.value,
			foreground: this.refs.foreground.value,
			background: this.refs.background.value
		};
		this.setState(state);
		this.set_hash(state);
	}
	set_hash(given_state) {
		const { unit, width, height, ...state } = given_state || this.state;
		const params = Object.entries(state).filter(([k, v]) => defaults[k] !== v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
		window.location.hash = params.length ? `#${params.join('&')}` : '';
	}
	render() {
		const { thickness, foreground, background } = this.state;
		return React.createElement(
			"div",
			null,
			React.createElement(Logo, this.state),
			React.createElement(
				"div",
				{ id: "controls" },
				React.createElement("input", { ref: "thickness", type: "range", value: thickness, min: 1, max: 5, step: 0.05, onChange: () => this.set_css() }),
				React.createElement("input", { ref: "foreground", type: "color", value: foreground, onChange: () => this.set_css() }),
				React.createElement("input", { ref: "background", type: "color", value: background, onChange: () => this.set_css() })
			)
		);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	container = document.querySelector('#container');
	ReactDOM.render(React.createElement(ReactiveLogo, null), container);
});
