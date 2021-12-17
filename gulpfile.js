
// let project_folder="0result";  // конечная папка компиляции
const project_folder="©Result_" + require("path").basename(__dirname);  // конечная папка компиляции
const source_folder="#src";  // папка исходников 

const fs = require("fs");  // переменная подключения шрифтов в CSS

let path={   // пути
  build:{   // результат
    html:project_folder+"/",
    css:project_folder+"/css/",
    js:project_folder+"/js/",
    img:project_folder+"/img/",
    fonts:project_folder+"/fonts/", 
  },

  src:{   // Исходники
    html: [ source_folder+"/*.html", "!"+ source_folder + "/_*.html"],
    css:source_folder+"/scss/style.scss", // только 1 файл
    js:source_folder+"/js/script.js", //только 1 файл ---  *.js = вся папка 
    img:source_folder+"/img/**/*.+(png|jpg|gif|ico|svg|webp) ",  // **-слушать все подпапки + расширения *.{jpg,png,svg,gif,ico,webp}
    fonts:source_folder+"/fonts/*.ttf",
    
  },
// Отлавлеватель
  watch:{   // Отлавлеватель
    html:source_folder+"/**/*.html",
    css:source_folder+"/scss/**/*.scss", // только 1 файл
    js:source_folder+"/js/**/*.js", // вся папка
    img:source_folder+"/img/**/*.+(png|jpg|gif|ico|svg|webp) ",  // **-слушать все подпапки + расширения *.{jpg,png,svg,gif,ico,webp}
    
  },
  clean:"./"+ project_folder + "/"

 
}

//============= пачке переменныхъ
let {src, dest} = require("gulp"),
    gulp = require("gulp"),
    browsersync =  require("browser-sync").create(), // плагин сервера
    del =  require("del"), // плагин удаление папки

    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'), // сборщик SCSS и css файлов в 1
    cleanCSS = require('gulp-clean-css'), //  очистка и сжатие конечного css файла
    rename = require('gulp-rename'),
    terser = require('gulp-terser'),// пл мини js
    // ---------пл IMG -------------------
    imagemin = require('gulp-imagemin'),// пл мини IMG
    webp = require('gulp-webp'),  // Модные форматы Картинок
    webp_html = require('gulp-webp-html'), // плг авто пути картинок + веб
    webp_css = require('gulp-webpcss'), // плг авто пути картинок + веб
    svg_sprite = require('gulp-svg-sprite'); // плг авто пути картинок + веб
    // ---------Шрифты-------------------
    const ttf2woff = require('gulp-ttf2woff'); // плг 
    const ttf2woff2 = require('gulp-ttf2woff2'); // плг 
    const fonter = require('gulp-fonter'); // плг gulp-fonter
  // END -- let 

const fileinclude = require("gulp-file-include"); // плагин сборки файлов
//END============= пачке переменныхъ===============END

function browsSync(params){
  browsersync.init({ // настройки плагина 
    server:{ baseDir:"./"+ project_folder + "/"},
    port: 3000,
    notify: false
  })
}

//! функция временной сборки на лок сервер
function html () {
  return src(path.src.html) 
      .pipe(fileinclude())
      .pipe(webp_html()) // пл авто пути картинок!
      .pipe(dest(path.build.html))  // функция команды для гаупа
      .pipe(browsersync.stream())
      
}
//! ===END=== функция временной сборки ===END===
//======= + SCSS  ================
function css () {
  return src(path.src.css)
       .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
       .pipe(group_media() )

      .pipe(autoprefixer ({ //  команда autoprefixer
           overrideBrowserslist: ["last 5 versions"], // последние 5 версий браузеров
           cascade: true  // стиль написание префиксов = каскад
          })
       )  //  команда autoprefixer

      .pipe(webp_css() ) // выгрузка файла CSS  // {webpClass: '.webp',noWebpClass: '.no-webp'}
      .pipe(dest(path.build.css))  // выгрузка файла CSS
      .pipe(cleanCSS()) // функция сжатия 
      .pipe(rename({extname:".min.css"})) // функция переименования   
      .pipe(dest(path.build.css))  // выгрузка файла min CSS

      .pipe(browsersync.stream());  
}
//  ===END=== + SCSS  ===END===
function js () {
  return src(path.src.js)
      .pipe(fileinclude())
      .pipe(dest(path.build.js))  // функция команды для гаупа

      .pipe(terser())  // вкл плагина сжатия
      .pipe(rename({extname:".min.js"})) // функция переименования   
      .pipe(dest(path.build.js))  // выгрузка файла min JS
      .pipe(browsersync.stream())
      
}

function fonts2(params){  // 1.07 время
  return src(path.src.fonts) // загрузка
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))  // выгрузка шрифтов
}
function fonts1(params){  // 1.07 время
  return src(path.src.fonts)// загрузка
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts)) // выгрузка шрифтов
}

function image () {
  return src(path.src.img) // обращаемся к исходникам

      .pipe( webp({quality: 70 }))  
      .pipe(dest(path.build.img))  // выгрузка картинок webp

      .pipe(src(path.src.img))  // заново обращаемся к исходникам
//-----------.pipe пл imagemin
      .pipe(imagemin([
          imagemin.gifsicle({interlaced: true}),
          imagemin.mozjpeg({quality: 75, progressive: true}),
          imagemin.optipng({optimizationLevel: 5}), // от 0 до 7
          imagemin.svgo({
                    plugins: [
                      {removeViewBox: false},
                      {cleanupIDs: false}
                    ] // plugins:
                  }) // .svgo
          ]) // imagemin([
      )  //.pipe пл imagemin

      .pipe(dest(path.build.img))  // выгрузка картинок imagemin
      .pipe(browsersync.stream())     
}

// отдельный вызов // gulp otf2ttf  // gulp svg_sprite
gulp.task("otf2ttf", function(){
  return gulp.src([source_folder + "/fons/*.otf"])
      .pipe ( fonter ({formats:["ttf"] }) )
      .pipe (dest(source_folder + "/fons/"));
});

gulp.task("svg_sprite", function(){
  return gulp.src([source_folder + "/iconsprite/*.svg"])

  .pipe(svg_sprite({
    mode:{
      stack:{
      sprite: "../spriteIcons/spriteIcons.svg", // команда gulp svg_sprite
      example: true
    }}, 

  }))
  .pipe(dest(path.build.img)) // выгрузка путь
});
//END отдельный вызов END
function fontsRun(params){ //  ФН  запуска путей = шрифтов в CSS
  let file_content = fs.readFileSync(source_folder + '/scss/fontsRun.scss');
   if (file_content == '') {
      fs.writeFile(source_folder + '/scss/fontsRun.scss', '', cb);
       return fs.readdir(path.build.fonts, function (err, items) { 
         if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
            let fontname = items[i].split('.'); fontname = fontname[0]; 
            if (c_fontname != fontname) { 
               fs.appendFile(source_folder + '/scss/fontsRun.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
             }
                c_fontname = fontname; }
           }
           }) 
          }
}

function cb(params){ //  ФН  кулбек подключения шрифтов в CSS

}


function watchFiles(params){ //  обн изменений
  gulp.watch([path.watch.html], html); // следить за  html + ,html= функция
  gulp.watch([path.watch.css], css); // следить за  html + ,html= функция
  gulp.watch([path.watch.js], js); // следить за  js
  gulp.watch([path.watch.img], image); // следить за картинками
}

function clean(params){  // удаление врем ппки
  return del(path.clean);
}

let build = gulp.series(clean , gulp.parallel(js, css, html, image, fonts2),fontsRun); // gulp.parallel - выполнение функ поралельно
let watch = gulp.parallel(build, watchFiles, browsSync); // в скобках функции


exports.fontsRun = fontsRun;
exports.fonts2 = fonts2;
exports.fonts1 = fonts1;
exports.image = image ;
exports.js = js ;
exports.css = css ;
exports.html = html ;
exports.build = build ;
exports.watch = watch;
exports.default = watch;

// для SASS
exports.watch = function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
};
// для SASS


