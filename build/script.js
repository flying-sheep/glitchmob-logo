var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const { sqrt } = Math;

const defaults = {
	thickness: '1',
	foreground: '#000000',
	background: '#ffffff'
};

const style_vars = ({ thickness, foreground, background }) => ({
	'--thickness': thickness,
	'--foreground': foreground,
	'--background': background
});

const get_dims = () => ({
	unit: Math.min(document.body.offsetWidth, document.body.offsetHeight) / 3,
	width: document.body.offsetWidth,
	height: document.body.offsetHeight
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

function download(uri, filename) {
	const evt = new MouseEvent('click', {
		view: window,
		bubbles: false,
		cancelable: true
	});

	const a = document.createElement('a');
	a.setAttribute('download', filename);
	a.setAttribute('href', uri);
	a.setAttribute('target', '_blank');

	a.dispatchEvent(evt);
}

function download_svg_as_png(svg, width = 1000, height = 1000, filename = 'image.png') {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext('2d');
	const data = new XMLSerializer().serializeToString(svg);

	const img = new Image();
	const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	img.onload = () => {
		ctx.drawImage(img, 0, 0);
		URL.revokeObjectURL(url);

		const uri = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

		download(uri, filename);
	};

	img.src = url;
}

const Logo = ({
	unit: u, width, height,
	thickness, foreground, background,
	svgref
}) => {
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
		'svg',
		{
			ref: svgref,
			viewBox: `${-width / 2} -${height / 2} ${width} ${height}`,
			preserveAspectRatio: 'xMaxYMax',
			style: style_vars({ thickness, foreground, background })
		},
		React.createElement('circle', { r: u, cx: ab.x, cy: '0' }),
		React.createElement('circle', { r: u, cx: ca.x, cy: '0' }),
		'// inverted smaller triangle',
		React.createElement('path', { d: `
      M ${ab.x} ${-ab.y}
			L ${bc.x} ${-bc.y}
      L ${ca.x} ${-ca.y}
			Z
		` }),
		'// upright larger triangle',
		React.createElement('path', { d: `
      M ${a.x} ${-a.y}
			L ${b.x} ${-b.y}
      L ${c.x} ${-c.y}
			Z
		` })
	);
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
	download_svg() {
		const { width, height } = this.state;
		const styled = this.svg.cloneNode(true);
		//TODO: add stylesheet
		styled.setAttribute('width', width);
		styled.setAttribute('height', height);
		styled.style = { ...style_vars(defaults), ...styled.style };
		download_svg_as_png(styled, width, height, 'glitchmob-logo.png');
	}
	render() {
		const { thickness, foreground, background } = this.state;
		return [React.createElement(Logo, _extends({ key: 'logo', svgref: el => this.svg = el }, this.state)), React.createElement(
			'div',
			{ key: 'controls', id: 'controls' },
			React.createElement('input', { ref: 'thickness', type: 'range', value: thickness, min: 1, max: 5, step: 0.05, onChange: () => this.set_css() }),
			React.createElement('input', { ref: 'foreground', type: 'color', value: foreground, onChange: () => this.set_css() }),
			React.createElement('input', { ref: 'background', type: 'color', value: background, onChange: () => this.set_css() }),
			React.createElement(
				'button',
				{ onClick: () => this.download_svg() },
				'Download'
			)
		)];
	}
}

document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(React.createElement(ReactiveLogo, null), document.body);
});
