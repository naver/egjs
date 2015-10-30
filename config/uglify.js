module.exports = {
	options: {
		banner: "<%=banner%>"
	},
	dist: {
		src: "dist/<%=pkg.outputname%>.js",
		dest: "dist/<%=pkg.outputname%>.min.js"
	}
};