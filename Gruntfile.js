/*global module:false*/
module.exports = function(grunt) {
// NOTA: - PARA QUE FUNCIONE LOS URL('') EN LOS CSS CONCATENADOS 
// 		          TODOS LOS CSS DEBEN ESTAR EN EL MISMO NIVEL
// 		  - NO BORRAR LA CARPETA JS YA QUE HAY ESTAN LAS LIBRERIAS Y NO EN SRCJAVASCRIPT
	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		// banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
		// 	'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		// 	'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
		// 	' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		csslint: {
			options: {
				'important': false,
				'adjoining-classes': false,
			// 	'known-properties': false,
				'box-sizing': false,
				'box-model': false,
				'overqualified-elements': false,
			// 	'display-property-grouping': false,
				'bulletproof-font-face': false,
				'compatible-vendor-prefixes': false,
			// 	'regex-selectors': false,
			// 	'errors': false,
			// 	'duplicate-background-images': false,
			// 	'duplicate-properties': false,
				'empty-rules': false,
			// 	'selector-max-approaching': false,
			// 	'gradients': false,
				'fallback-colors': false,
				'font-sizes': false,
				'font-faces': false,
			// 	'floats': false,
			// 	'star-property-hack': false,
				'outline-none': false,
			// 	'import': false,
				'ids': false,
			// 	'underscore-property-hack': false,
			// 	'rules-count': false,
				"qualified-headings": false,
			// 	'selector-max': false,
			// 	'shorthand': false,
			// 	'text-indent': false,
				'unique-headings': true,
			// 	'universal-selector': false,
			// 	'unqualified-attributes': false,
			// 	'vendor-prefix': false,
				'zero-units': false
			},
			app: {	
				src: ['*.css']
			}
		},
		jshint: {
			options: '<%= pkg.jshintConfig %>',
			app: {
				src: [
					'js/functions/*.js',
					'js/app.js'
				]
			}
		},
		cssmin: { // concatena y MINIFICA CSS
			options: {
				// banner: '<%= banner %>'
			},
			app: {
				src: 'style.css',
				dest: 'style.min.css'
			}
		},
		uglify: { // concatena y MINIFICA JS
			options: {
				// banner: '<%= banner %>'
			},
			app : {
				src : [ // clases base y validChars
					'js/functions/helpers.js',
					'js/functions/controls.js',
					'js/functions/albumChoose.js',
					'js/functions/friendChoose.js',
					'js/functions/app.js',
				],
				dest : 'panel/resources/js/app.min.js'
			}
		},
		versioning: {
			// options: {
			// 	// keepOriginal: true // no borrar el original xq newer lo vuelve a crear
			// },
				sprites: {
					options: { grepFiles: 'style.css' },
					src: 'img/sprites.png'
				},
				style: {
					options: { grepFiles: 'index.php' },
					src: [
						'<%= cssmin.app.dest %>',
						'<%= uglify.app.dest %>'
					]
				}
		}
	});
	// // Load 
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-version-assets');
	// Default task.
	grunt.registerTask('default', function () {
		// ejecutar primero sprites
		grunt.task.run('versioning:sprites');
		setTimeout(function () {
			// borrarlo
			delete grunt.config.data.versioning.sprites;
			// ejecutar resto
			grunt.task.run('newer:cssmin');
			grunt.task.run('newer:uglify');
			grunt.task.run('versioning');
		}, 0);
	});
};