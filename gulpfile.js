/* eslint-disable @typescript-eslint/no-var-requires */
// https://github.com/godbasin/wxapp-typescript-demo/blob/master/gulpfile.js

const gulp = require('gulp')
const rename = require('gulp-rename')
const changed = require('gulp-changed')
const clear = require('gulp-clean')
const del = require('del')

const sass = require('gulp-dart-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const jsonTransform = require('gulp-json-transform')
const projectConfig = require('./package.json')
const alias = require('gulp-ts-alias')
const aliases = require('gulp-style-aliases')

const option = {
  base: 'src',
  allowEmpty: true,
}

const dist = __dirname + '/dist'
const copyPath = ['src/**/*.wxml', 'src/**/*.json', 'src/**/*.js']
const sassPath = ['src/**/*.scss']
const tsPath = ['src/**/*.ts']
const dependencies = projectConfig && projectConfig.dependencies
const nodeModulesCopyPath = []

const handleDelFile = async (path) => {
  const distPath = path.replace('src', 'dist')
  await del([distPath])
}

for (let d in dependencies) {
  nodeModulesCopyPath.push('node_modules/' + d + '/**/*')
}

const copyNodeModuleOption = {
  base: '.',
  allowEmpty: true,
}

gulp.task('copy', () => {
  return gulp.src(copyPath, option).pipe(gulp.dest(dist))
})

gulp.task('copyChange', () => {
  return gulp.src(copyPath, option).pipe(changed(dist)).pipe(gulp.dest(dist))
})

gulp.task('sass', () => {
  return gulp
    .src(sassPath, option)
    .pipe(
      aliases({
        '@': __dirname + '/src',
      }),
    )
    .pipe(sass())
    .pipe(postcss([autoprefixer]))
    .pipe(
      rename(function (path) {
        path.extname = '.wxss'
      }),
    )
    .pipe(gulp.dest(dist))
})

gulp.task('sassChange', () => {
  return gulp
    .src(sassPath, option)
    .pipe(changed(dist))
    .pipe(
      aliases({
        '@': __dirname + '/src',
      }),
    )
    .pipe(sass())
    .pipe(postcss([autoprefixer]))
    .pipe(
      rename(function (path) {
        path.extname = '.wxss'
      }),
    )
    .pipe(gulp.dest(dist))
})

gulp.task('tsCompile', function () {
  return tsProject
    .src()
    .pipe(alias({ configuration: tsProject.config }))
    .pipe(tsProject())
    .pipe(gulp.dest(dist))
})

gulp.task('copyNodeModules', () => {
  return gulp.src(nodeModulesCopyPath, copyNodeModuleOption).pipe(gulp.dest(dist))
})

gulp.task('copyNodeModulesChange', () => {
  return gulp.src(nodeModulesCopyPath, copyNodeModuleOption).pipe(changed(dist)).pipe(gulp.dest(dist))
})

gulp.task('generatePackageJson', () => {
  return gulp
    .src('./package.json')
    .pipe(
      jsonTransform(function () {
        return {
          dependencies: dependencies,
        }
      }),
    )
    .pipe(gulp.dest(dist))
})

gulp.task('clear', () => {
  return gulp.src(dist, { allowEmpty: true }).pipe(clear())
})

gulp.task('watch', () => {
  gulp.watch(nodeModulesCopyPath, gulp.series('copyNodeModulesChange'))
  const copyWatcher = gulp.watch(copyPath, gulp.series('copyChange'))
  const tsWatcher = gulp.watch(tsPath, gulp.series('tsCompile'))
  const sassWatcher = gulp.watch(sassPath, gulp.series('sassChange'))
  copyWatcher.on('unlink', (path) => handleDelFile(path))
  tsWatcher.on('unlink', (path) => handleDelFile(path))
  sassWatcher.on('unlink', (path) => handleDelFile(path))
})

gulp.task(
  'default',
  gulp.series(
    // sync
    gulp.parallel('copyNodeModules', 'generatePackageJson', 'copy', 'sass', 'tsCompile'),
    'watch',
  ),
)

gulp.task(
  'build',
  gulp.series(
    // sync
    'clear',
    gulp.parallel(
      // async
      'copyNodeModules',
      'generatePackageJson',
      'copy',
      'sass',
      'tsCompile',
    ),
  ),
)
