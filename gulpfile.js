/* eslint-disable @typescript-eslint/no-var-requires */
// https://github.com/godbasin/wxapp-typescript-demo/blob/master/gulpfile.js

const gulp = require('gulp')
const path = require('path')
const rename = require('gulp-rename')
const changed = require('gulp-changed')
const clear = require('gulp-clean')
const del = require('del')

const sass = require('gulp-dart-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const sourcemaps = require('gulp-sourcemaps')
const jsonTransform = require('gulp-json-transform')
const projectConfig = require('./package.json')
const alias = require('gulp-ts-alias')

const option = {
  base: 'src',
  allowEmpty: true,
}

const dist = __dirname + '/dist'
const copyPath = ['src/**/!(_)*.*', '!src/**/*.sass', '!src/**/*.scss', '!src/**/*.ts']
const sassPath = ['src/**/*.sass', 'src/app.sass', 'src/**/*.scss', 'src/app.scss']
const watchSassPath = ['src/**/*.sass', 'src/app.sass', 'src/**/*.scss', 'src/app.scss']
const tsPath = ['src/**/*.ts', 'src/app.ts']

gulp.task('clear', () => {
  return gulp.src(dist, { allowEmpty: true }).pipe(clear())
})

gulp.task('copy', () => {
  return gulp.src(copyPath, option).pipe(gulp.dest(dist))
})
gulp.task('copyChange', () => {
  return gulp.src(copyPath, option).pipe(changed(dist)).pipe(gulp.dest(dist))
})

const dependencies = projectConfig && projectConfig.dependencies // dependencies配置
const nodeModulesCopyPath = []
for (let d in dependencies) {
  nodeModulesCopyPath.push('node_modules/' + d + '/**/*')
}
const copyNodeModuleOption = {
  base: '.',
  allowEmpty: true,
}

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

gulp.task('sass', () => {
  return gulp
    .src(sassPath, option)
    .pipe(
      sass().on('error', function (e) {
        console.error(e.message)
        this.emit('end')
      }),
    )
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
      sass().on('error', function (e) {
        console.error(e.message)
        this.emit('end')
      }),
    )
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
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .js.pipe(
      sourcemaps.write({
        sourceRoot: (file) => path.relative(path.join(file.cwd, file.path), file.base),
      }),
    )
    .pipe(gulp.dest('dist'))
})

gulp.task('watch', () => {
  gulp.watch(tsPath, gulp.series('tsCompile'))
  const watcher = gulp.watch(copyPath, gulp.series('copyChange'))
  gulp.watch(nodeModulesCopyPath, gulp.series('copyNodeModulesChange'))
  gulp.watch(watchSassPath, gulp.series('sassChange')) //Change
  watcher.on('change', function (event) {
    if (event.type === 'deleted') {
      const filepath = event.path
      const filePathFromSrc = path.relative(path.resolve('src'), filepath)
      // Concatenating the 'build' absolute path used by gulp.dest in the scripts task
      const destFilePath = path.resolve('dist', filePathFromSrc)
      // console.log({filepath, filePathFromSrc, destFilePath})
      del.sync(destFilePath)
    }
  })
})

gulp.task(
  'default',
  gulp.series(
    // sync
    gulp.parallel('copy', 'copyNodeModules', 'generatePackageJson', 'sass', 'tsCompile'),
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
      'copy',
      'copyNodeModules',
      'generatePackageJson',
      'sass',
      'tsCompile',
    ),
  ),
)
