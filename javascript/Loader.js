document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('login-form');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      document.getElementById('loader').style.display = 'none';
      
      setTimeout(function() {
        document.getElementById('loader').style.display = 'flex';
        document.body.style.overflow = 'auto';
      }, 1);

      setTimeout(function() {
        document.getElementById('loader').style.display = 'none';
        }, 4500);
    });
  });

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('signup-form');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      document.getElementById('loader').style.display = 'none';
      
      setTimeout(function() {
        document.getElementById('loader').style.display = 'flex';
        document.body.style.overflow = 'auto';
      }, 1);

      setTimeout(function() {
        document.getElementById('loader').style.display = 'none';
        }, 4500);
    });
  });
  