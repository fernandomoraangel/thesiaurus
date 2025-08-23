document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://ljxaakuiepxxdqsqcpsc.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeGFha3VpZXB4eGRxc3FjcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzQ3NzUsImV4cCI6MjA3MTIxMDc3NX0.q7jfHERVexiluOWwwetf-NSYZeRPg-JJfcs77Zug5ys";
  const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // Redirect if user is already logged in
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (
      session &&
      (window.location.pathname === "/index.html" ||
        window.location.pathname === "/register.html")
    ) {
      window.location.href = "./main.html";
    }
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Swal.fire("Error", error.message, "error");
      } else {
        window.location.href = "./main.html";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Swal.fire("Error", error.message, "error");
      } else {
        Swal.fire(
          "¡Éxito!",
          "Revisa tu correo para verificar tu cuenta.",
          "success"
        ).then(() => {
          window.location.href = "/login.html";
        });
      }
    });
  }
});
