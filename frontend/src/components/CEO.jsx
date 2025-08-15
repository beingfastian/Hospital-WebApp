import React from "react";

const CEO = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-gray-800 md:mx-10">
      {/* Section Title */}
      <h1 className="text-3xl font-medium text-center">Message from Our CEO</h1>
      <p className="sm:w-1/2 text-center text-sm text-gray-600 mb-8">
        Leadership dedicated to providing exceptional healthcare services with compassion and excellence.
      </p>

      {/* CEO Content */}
      <div className="w-full flex flex-col lg:flex-row gap-12 items-center lg:items-start">
        {/* CEO Image */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src="/src/assets/CEO.jpg"
              alt="Dr. Muhammad Siddique - CEO"
              className="w-80 h-80 object-cover rounded-2xl shadow-lg"
            />
            {/* Professional Badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-lg border border-gray-200">
              <p className="text-sm font-medium text-primary">Chief Executive Officer</p>
            </div>
          </div>
        </div>

        {/* CEO Information */}
        <div className="flex-1 max-w-4xl">
          {/* CEO Details */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-8 rounded-2xl mb-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-2">Dr. Muhammad Siddique</h2>
            <p className="text-xl opacity-90 mb-4">Chief Executive Officer</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">MBBS</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">MCPS</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">DCH</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">Child Specialist</span>
            </div>
          </div>

          {/* CEO Message */}
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-primary rounded-full"></span>
              Message from CEO
            </h3>
            
            <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                This hospital represents my lifelong dedication to medicine and my unwavering belief that 
                every patient deserves the highest quality care, delivered with empathy and respect. From 
                the very beginning, our mission has been to create a place where healing goes beyond treatment, 
                where advanced medical expertise is combined with compassion, dignity, and a deep understanding 
                of each individual's needs.
              </p>
              
              <p>
                We are committed to continuously enhancing our facilities, embracing the latest medical 
                technologies, and fostering a team of highly skilled healthcare professionals who share 
                the same passion for patient well-being. Our goal is not only to treat illness but also 
                to promote healthier lives, support families, and strengthen the community we proudly serve.
              </p>
              
              <p>
                Every decision we make and every service we provide is guided by our dedication to excellence 
                and our promise to keep patients at the heart of everything we do. Together, we will continue 
                to grow, innovate, and ensure that world-class healthcare remains accessible to all.
              </p>
            </div>

            {/* Vision Statement */}
            <div className="mt-8 p-6 bg-white rounded-xl border-l-4 border-primary">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Our Vision</h4>
              <p className="text-gray-600 italic">
                To provide world-class healthcare that combines cutting-edge medical expertise with 
                compassionate care, making quality healthcare accessible to every member of our community.
              </p>
            </div>

            {/* CEO Signature */}
            <div className="mt-8 flex items-center gap-4">
              <div className="w-24 h-0.5 bg-primary"></div>
              <div>
                <p className="font-semibold text-gray-800">Dr. Muhammad Siddique</p>
                <p className="text-sm text-gray-600">Chief Executive Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="w-full mt-12 bg-primary rounded-2xl p-8 text-center text-white">
        <h3 className="text-2xl font-semibold mb-4">Experience Healthcare Excellence</h3>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Under Dr. Siddique's leadership, our hospital continues to set new standards in patient care 
          and medical excellence. Schedule your appointment today.
        </p>
        <button 
          onClick={() => {
            const whatsappNumber = "+923348400517";
            const message = "Hello! I would like to schedule an appointment at Siddique Hospital. Please provide me with available times.";
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Book Your Appointment
        </button>
      </div>
    </div>
  );
};

export default CEO;