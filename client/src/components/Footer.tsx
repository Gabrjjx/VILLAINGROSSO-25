export default function Footer() {
  return (
    <footer className="bg-primary-sea text-white py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-display font-bold">Villa Ingrosso</h2>
            <p className="mt-2">Il tuo rifugio sul mare a Leporano</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="mb-2">© {new Date().getFullYear()} Villa Ingrosso. Tutti i diritti riservati.</p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-white hover:text-accent-sea transition-colors">Privacy</a>
              <a href="#" className="text-white hover:text-accent-sea transition-colors">Termini</a>
              <a href="#contact" className="text-white hover:text-accent-sea transition-colors">Contatti</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
