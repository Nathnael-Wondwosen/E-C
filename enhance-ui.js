const fs = require('fs');
const path = require('path');

// Path to the index.js file
const filePath = path.join(__dirname, 'frontend', 'customer-portal', 'pages', 'index.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Enhance the hero section height
content = content.replace(
  '<section className="relative h-64 md:h-96 overflow-hidden">',
  '<section className="relative h-64 md:h-[500px] overflow-hidden">'
);

// Enhance the hero content with backdrop and animations
content = content.replace(
  '<div className="md:w-1/2 text-white">\n' +
  '                    <h2 className="text-2xl md:text-4xl font-bold mb-3">{slide.title}</h2>\n' +
  '                    <p className="text-lg md:text-xl mb-6">{slide.subtitle}</p>\n' +
  '                    <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">\n' +
  '                      {slide.cta}\n' +
  '                    </button>\n' +
  '                  </div>',
  '<div className="md:w-1/2 text-white backdrop-blur-sm bg-black bg-opacity-30 p-8 rounded-2xl shadow-2xl transform transition-transform duration-700 hover:scale-105">\n' +
  '                    <h2 className="text-2xl md:text-4xl font-bold mb-3 animate-fadeInUp">{slide.title}</h2>\n' +
  '                    <p className="text-lg md:text-xl mb-6 animate-fadeInUp delay-100">{slide.subtitle}</p>\n' +
  '                    <button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:scale-105 shadow-lg">\n' +
  '                      {slide.cta}\n' +
  '                    </button>\n' +
  '                  </div>'
);

// Enhance the carousel image container
content = content.replace(
  '<div className="bg-white bg-opacity-20 border-2 border-dashed border-white border-opacity-30 rounded-xl w-64 h-48 md:w-80 md:h-64 flex items-center justify-center">\n' +
  '                      <span className="text-white text-lg">Carousel Image</span>\n' +
  '                    </div>',
  '<div className="bg-white bg-opacity-20 border-2 border-dashed border-white border-opacity-30 rounded-xl w-64 h-48 md:w-80 md:h-64 flex items-center justify-center backdrop-blur-sm shadow-2xl transform transition-transform duration-700 hover:scale-105">\n' +
  '                      <span className="text-white text-lg">Carousel Image</span>\n' +
  '                    </div>'
);

// Enhance carousel indicators
content = content.replace(
  'className={`w-3 h-3 rounded-full ${index === currentSlide ? \'bg-white\' : \'bg-white bg-opacity-50\'}`}',
  'className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${index === currentSlide ? \'bg-white scale-125\' : \'bg-white bg-opacity-50\'}`}'
);

// Add navigation arrows
const carouselEndPattern = '</div>\n          </section>';
const carouselEndReplacement = 
  '</div>\n' +
  '          \n' +
  '          {/* Navigation Arrows */}\n' +
  '          <button \n' +
  '            onClick={() => setCurrentSlide((currentSlide - 1 + carouselSlides.length) % carouselSlides.length)}\n' +
  '            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all duration-300"\n' +
  '          >\n' +
  '            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\n' +
  '              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>\n' +
  '            </svg>\n' +
  '          </button>\n' +
  '          <button \n' +
  '            onClick={() => setCurrentSlide((currentSlide + 1) % carouselSlides.length)}\n' +
  '            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all duration-300"\n' +
  '          >\n' +
  '            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">\n' +
  '              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>\n' +
  '            </svg>\n' +
  '          </button>\n' +
  '        </section>';

content = content.replace(carouselEndPattern, carouselEndReplacement);

// Enhance header shadow
content = content.replace(
  '<header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg sticky top-0 z-50">',
  '<header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl sticky top-0 z-50 transition-all duration-300">'
);

// Enhance BC logo
content = content.replace(
  '<span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg px-2 py-1 mr-2 shadow-md">BC</span>',
  '<span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg px-2 py-1 mr-2 shadow-lg transform hover:scale-105 transition-transform duration-300">BC</span>'
);

// Enhance search button
content = content.replace(
  '<button className="absolute right-0 top-0 h-full px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-r-full hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md">',
  '<button className="absolute right-0 top-0 h-full px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-r-full hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">'
);

// Enhance header links
content = content.replace(
  '<Link href="/favorites" className="flex flex-col items-center text-gray-300 hover:text-white transition-colors duration-300">',
  '<Link href="/favorites" className="flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110">'
);

// Enhance cart badge
content = content.replace(
  '<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>',
  '<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">3</span>'
);

// Enhance mobile menu button
content = content.replace(
  '<button \n              onClick={() => setIsMenuOpen(!isMenuOpen)}\n              className="p-2 rounded-md text-gray-300 focus:outline-none"\n            >',
  '<button \n              onClick={() => setIsMenuOpen(!isMenuOpen)}\n              className="p-2 rounded-md text-gray-300 focus:outline-none transform hover:scale-110 transition-transform duration-300"\n            >'
);

// Enhance mobile cart badge
content = content.replace(
  '<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>',
  '<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">3</span>'
);

// Enhance navigation menu shadow
content = content.replace(
  '<nav className="hidden md:block bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">',
  '<nav className="hidden md:block bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white shadow-lg">'
);

// Enhance mobile menu
content = content.replace(
  '<div className="md:hidden bg-white shadow-lg absolute w-full z-40">',
  '<div className="md:hidden bg-white shadow-2xl absolute w-full z-40 transform translate-y-0 opacity-100 transition-all duration-300">'
);

// Enhance mobile menu links
content = content.replace(
  'className="block px-4 py-3 hover:bg-gray-100 flex items-center"',
  'className="block px-4 py-3 hover:bg-gray-100 flex items-center transform hover:translate-x-2 transition-transform duration-200"'
);

content = content.replace(
  'className="block px-4 py-3 hover:bg-gray-100"',
  'className="block px-4 py-3 hover:bg-gray-100 transform hover:translate-x-2 transition-transform duration-200"'
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('UI enhancements applied successfully!');