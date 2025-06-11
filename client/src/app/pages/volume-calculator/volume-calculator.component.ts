import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { trigger, transition, style, animate } from '@angular/animations';

interface Item {
  name: string;
  volume: number;
  quantity: number;
  image: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface Category {
  [key: string]: Item[];
}

interface CategoryInfo {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-volume-calculator',
  templateUrl: './volume-calculator.component.html',
  styleUrls: ['./volume-calculator.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class VolumeCalculatorComponent implements OnInit {
  totalVolume = 0;
  cart: Item[] = [];
  activeCategory = 'Chambre';
  showModal = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm: string = '';
  isLoading: boolean = false;
  toasts: Toast[] = [];
  filteredItems: Item[] = [];
  totalItems: number = 0;

  // Category metadata with icons
  categoryInfos: CategoryInfo[] = [

    { name: 'Chambre', icon: '🛏️' },
    { name: 'Buanderie', icon: '🧺' },
    // { name: 'Emballés', icon: '📦' },
    { name: 'Couloir', icon: '🚪' },
    { name: 'Cuisine', icon: '🍳' },
    { name: 'Salon', icon: '🛋️' },
    { name: 'Divers', icon: '📦' },
    // { name: 'Sur mesure', icon: '📏' }
  ];

  categories: Category = {
    Salon: [
        { name: "Canapé d'angle", volume: 3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/canape-a-1.png" },
        { name: "Table (8 pers.)", volume: 2.6, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/table-g.png" },
        { name: "Canapé 3 places", volume: 2.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/canape3-1.png" },
        { name: "Canapé 2 places", volume: 2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/canape-2.png" },
        { name: "Canapé dimentable", volume: 1.6 , quantity: 0, image: "https://crm.rapido-demenagement.fr/images/canape-2.png" },
        { name: "Bibliothèque grande", volume: 2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bibliotheque-g.png" },
        { name: "Table (4 pers.)", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/table-p.png" },
        { name: "Bureau (grand)", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bureau-g.png" },
        { name: "Commode", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/commode.png" },
        { name: "Bibliothèque medium", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bibliotheque-m.png" },
        { name: "Enfilade / Buffet bas", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/enfilade.png" },
        { name: "Bureau (petit)", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bureau-p.png" },
        { name: "Secrétaire", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/secretaire.png" },
        { name: "Lampadaire", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lampadaire.png" },
        { name: "Bibliothèque petite", volume: 0.8, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/biblioteque-p-1.png" },
        { name: "Meuble TV", volume: 0.7, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/meuble-tv.png" },
        { name: "Fauteuil", volume: 0.6, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/fauteuil.png" },
        { name: "Fauteuil de bureau", volume: 0.6, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/fauteuil-b.png" },
        { name: "Table basse", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/table-b.png" },
        { name: "Chaise de bureau", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaise-b.png" },
        { name: "Tapis", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tapis.png" },
        { name: "Plante", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/plantes-1.png" },
        { name: "Suspension", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/suspension.png" },
        { name: "Miroir", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/miroir.png" },
        { name: "Tableau", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tableau.png" },
        { name: "Télévision", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/television.png" },
        { name: "Chaise", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaise.png" },
        { name: "Lampe à poser", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lampe-p.png" },
        { name: "Imprimante", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/imprimante-p.png" },
        { name: "Tour d'ordinateur", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/ordi-t.png" },
        { name: "Ecran d'ordinateur", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/ordi-e.png" },
        { name: "Table guéridon", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tablegueridon.png" },
        { name: "Ventilateur", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/ventillateur.png" },
        { name: "Climatiseur", volume: 0.4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/climatiseur.png" },
      ],
    Buanderie:[
        { name: "Balai + serpillière", volume: 0.05, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/balai_serpillere.png" },
        { name: "Étendoir", volume: 0.4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/etendoir.png" },
        { name: "Aspirateur", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/aspirateur-1.png" },
        { name: "Lave vaisselle", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lavevaisselle-2.png" },
        { name: "Lave linge", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lavelinge-1.png" },
        { name: "Sèche linge", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lavelinge.png" },
        { name: "Table à repasser", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/planche-r.png" },
        { name: "Panier a linge", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chariot_a_linge-removebg-preview.png" },
        { name: "Grand Placard", volume: 1.20, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/hommedebout.png" },
        { name: "petit armoir", volume: 0.80, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/shoe_cabinet-removebg-preview.png" },
],
    Cuisine: [
        { name: "Réfrigérateur américain", volume: 2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/refri-am.png" },
        { name: "Table (4 pers.)", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/table-p.png" },
        { name: "Réfrigérateur haut", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/refri-h.png" },
        { name: "Réfrigérateur bas", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/refri-p.png" },
        { name: "Elément bas cuisine, sdb", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/cuisine-b.png" },
        { name: "Colonne cuisine, sdb", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/cuisine-c.png" },
        { name: "Chaise haute bébé", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaise-bb.png" },
        { name: "Four", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/four-1.png" },
        { name: "Cuisinière", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/cuisiniere-1.png" },
        { name: "Elément haut cuisine, sdb", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/cuisine-h.png" },
        { name: "Plante", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/plantes-1.png" },
        { name: "Suspension", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/suspension.png" },
        { name: "Four micro-onde", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/four-m-1.png" },
        { name: "Petit électroménager", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/petitelectro-1.png" },
        { name: "Casseroles, poêles", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/poele-1.png" },
        { name: "Tableau", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tableau.png" },
        { name: "Chaise", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaise.png" },
        { name: "Tabouret", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tabouret.png" },
        { name: "Lampe à poser", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lampe-p.png" },
        { name: "Buffet double", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/buffet_double.png" },
        { name: "Buffet", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/buffet.png" },
        { name: "Table allongée", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/table_allogee.png" },
        { name: "Chaise pliante", volume: 0.1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaisepliante.png" },
        { name: "Poubelle", volume: 0.15, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/pubelle-removebg-preview.png" },


      ],
    Chambre: [
        { name: "Armoire 3 portes", volume: 3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/armoire-3.png" },
        { name: "Lit 160", volume: 2.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lit-1-1.png" },
        { name: "Lit 140", volume: 2.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lit-2.png" },
        { name: "Armoire 2 portes", volume: 2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/armoire-2.png" },
        { name: "Bibliothèque grande", volume: 2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bibliotheque-g.png" },
        { name: "Bureau (grand)", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bureau-g.png" },
        { name: "Commode", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/commode.png" },
        { name: "Armoire 1 porte", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/armoire-1.png" },
        { name: "Lit bébé", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lit-bb-1.png" },
        { name: "Lit enfant", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lit-1.png" },
        { name: "Sommier", volume: 1.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/sommier-1.png" },
        { name: "Bibliothèque medium", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bibliotheque-m.png" },
        { name: "Lit 1 place", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lit-2-1.png" },
        { name: "Matelas", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/matelas.png" },
        { name: "Bureau (petit)", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/bureau-p.png" },
        { name: "Secrétaire", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/secretaire.png" },
        { name: "Lampadaire", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lampadaire.png" },
        { name: "Bibliothèque petite", volume: 0.8, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/biblioteque-p-1.png" },
        { name: "Fauteuil", volume: 0.6, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/fauteuil.png" },
        { name: "Fauteuil de bureau", volume: 0.6, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/fauteuil-b.png" },
        { name: "Coiffeuse", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/coiffeuse.png" },
        { name: "Chaise de bureau", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaise-b.png" },
        { name: "Tapis", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tapis.png" },
        { name: "Plante", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/plantes-1.png" },
        { name: "Suspension", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/suspension.png" },
        { name: "Table de chevet", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/table-c-1.png" },
        { name: "Miroir", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/miroir.png" },
        { name: "Tableau", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tableau.png" },
        { name: "Télévision", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/television.png" },
        { name: "Chaise", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaise.png" },
        { name: "Lampe à poser", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lampe-p.png" },
        { name: "Imprimante", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/imprimante-p.png" },
        { name: "Tour d'ordinateur", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/ordi-t.png" },
        { name: "Ecran d'ordinateur", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/ordi-e.png" },
        { name: "Canapé-lit", volume: 1.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/canapelit.png" },
        { name: "Homme debout", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/hommedebout.png" },
        { name: "Étagère", volume: 0.6, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/etagere.png" },
      ],
      Couloir:[
        { name: "Porte manteau", volume: 0.53, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/hat stand.png" },
        { name: "Table de couloir", volume: 0.6, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/halltable-removebg-preview.png" },
        { name: "Meuble à chaussures", volume: 0.35, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/shoe_cabinet-removebg-preview.png" },

      ],
    Divers: [
        { name: "Lit superposé", volume: 4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/lits-superposes.png" },
        { name: "Moto", volume: 4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/moto.png" },
        { name: "Piano quart de queue", volume: 3.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/piano-q.png" },
        { name: "Scooter", volume: 3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/scooter.png" },
        { name: "Table de jardin", volume: 4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/table-j.png" },
        { name: "Piano droit", volume: 2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/piano-d.png" },
        { name: "Vélo d'appartement", volume: 1.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/velo-a.png" },
        { name: "Vélo enfant", volume: 1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/velo-enfant.png" },
        { name: "Vélo adulte", volume: 0.8, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/velo-adulte.png" },
        { name: "Transat", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/transat.png" },
        { name: "Barbecue", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/barbecue.png" },
        { name: "Tricycle", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tricycle.png" },
        { name: "Cartons penderie", volume: 0.5, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/carton-p.png" },
        { name: "Coffre fort", volume: 0.4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/coffre-f.png" },
        { name: "Imprimante bureau", volume: 0.4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/imprimate-g-1.png" },
        { name: "Escabeau", volume: 0.4, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/escabeau.png" },
        { name: "Chaise de jardin", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chaise-j.png" },
        { name: "Parasol", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/parasol-1.png" },
        { name: "Tondeuse", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/tondeuse.png" },
        { name: "Boite à outils", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/boite-outils.png" },
        { name: "Valise", volume: 0.2, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/valise.png" },
        { name: "Carton livres", volume: 0.1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/carton-l.png" },
        { name: "Carton standard", volume: 0.1, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/carton-s.png" },
        { name: "Chariot", volume: 0.3, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/chariot.png" },
        { name: "Poussette", volume: 0.8, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/poussette.png" },
      ],
            Emballés:[
                   { name: "Poussette", volume: 0.8, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/poussette.png" },
     { name: "Poussette", volume: 0.8, quantity: 0, image: "https://crm.rapido-demenagement.fr/images/poussette.png" },

      ],
    "Sur mesure": []
  };

  ngOnInit(): void {
    // Initialize with Chambre category
    this.filterItemsByCategory('Chambre');
    this.calculateTotalItems();
  }

  // Calculate total number of items across all categories
  calculateTotalItems(): void {
    this.totalItems = Object.values(this.categories).reduce((total, items) => total + items.length, 0);
  }

  filterItemsByCategory(category: string): void {
    this.activeCategory = category;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.categories[this.activeCategory] || [];

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredItems = filtered;
  }

  getActiveCategoryItems(): Item[] {
    return this.filteredItems;
  }

  getCategoryItemCount(category: string): number {
    return this.cart.filter(item => {
      // Find the category of the item
      for (const [cat, items] of Object.entries(this.categories)) {
        if (items.some(i => i.name === item.name) && cat === category) {
          return true;
        }
      }
      return false;
    }).length;
  }

  getCartItemQuantity(item: Item): number {
    const cartItem = this.cart.find(cartItem => cartItem.name === item.name);
    return cartItem ? cartItem.quantity : 0;
  }

  onQuantityChange(item: Item, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = Math.max(0, parseInt(input.value) || 0);

    const existingItem = this.cart.find(cartItem => cartItem.name === item.name);

    if (existingItem) {
      this.totalVolume -= existingItem.volume * existingItem.quantity;

      if (newQuantity > 0) {
        existingItem.quantity = newQuantity;
        this.totalVolume += existingItem.volume * existingItem.quantity;
      } else {
        this.cart = this.cart.filter(cartItem => cartItem.name !== item.name);
      }
    } else if (newQuantity > 0) {
      const newItem = { ...item, quantity: newQuantity };
      this.cart.push(newItem);
      this.totalVolume += newItem.volume * newItem.quantity;
    }

    this.totalVolume = parseFloat(this.totalVolume.toFixed(2));
    
    // Update the quantity in the categories object
    for (const category of Object.values(this.categories)) {
      const categoryItem = category.find(i => i.name === item.name);
      if (categoryItem) {
        categoryItem.quantity = newQuantity;
        break;
      }
    }
    
    this.showToast('success', `${item.name} mis à jour`);
  }

  incrementQuantity(item: Item): void {
    const existingItem = this.cart.find(cartItem => cartItem.name === item.name);
    
    if (existingItem) {
      if (existingItem.quantity < 99) {
        existingItem.quantity++;
        this.updateTotalVolume();
        
        // Update the quantity in the categories object
        for (const category of Object.values(this.categories)) {
          const categoryItem = category.find(i => i.name === item.name);
          if (categoryItem) {
            categoryItem.quantity = existingItem.quantity;
            break;
          }
        }
        
        this.showToast('success', `${item.name} ajouté`);
      }
    } else {
      const newItem = { ...item, quantity: 1 };
      this.cart.push(newItem);
      
      // Update the quantity in the categories object
      for (const category of Object.values(this.categories)) {
        const categoryItem = category.find(i => i.name === item.name);
        if (categoryItem) {
          categoryItem.quantity = 1;
          break;
        }
      }
      
      this.updateTotalVolume();
      this.showToast('success', `${item.name} ajouté à la sélection`);
    }
  }

  decrementQuantity(item: Item): void {
    const existingItem = this.cart.find(cartItem => cartItem.name === item.name);
    
    if (existingItem) {
      if (existingItem.quantity > 1) {
        existingItem.quantity--;
        
        // Update the quantity in the categories object
        for (const category of Object.values(this.categories)) {
          const categoryItem = category.find(i => i.name === item.name);
          if (categoryItem) {
            categoryItem.quantity = existingItem.quantity;
            break;
          }
        }
        
        this.updateTotalVolume();
        this.showToast('info', `Quantité de ${item.name} réduite`);
      } else {
        this.removeItemFromCart(this.cart.indexOf(existingItem));
      }
    }
  }

  viewSelectedItems(): void {
    if (this.cart.length === 0) {
      this.showToast('info', 'Aucun article sélectionné');
      return;
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  removeItemFromCart(index: number): void {
    const item = this.cart[index];
    this.totalVolume -= item.volume * item.quantity;
    
    // Update the quantity in the categories object
    for (const category of Object.values(this.categories)) {
      const categoryItem = category.find(i => i.name === item.name);
      if (categoryItem) {
        categoryItem.quantity = 0;
        break;
      }
    }
    
    this.cart.splice(index, 1);
    this.totalVolume = parseFloat(this.totalVolume.toFixed(2));
    this.showToast('info', `${item.name} supprimé de la sélection`);
  }

  resetAll(): void {
    if (confirm("Êtes-vous sûr de vouloir tout réinitialiser ?")) {
      this.cart = [];
      this.totalVolume = 0;
      
      // Reset quantities in all categories
      Object.keys(this.categories).forEach(category => {
        this.categories[category].forEach(item => {
          item.quantity = 0;
        });
      });
      
      this.showToast('success', 'Tous les articles ont été réinitialisés');
    }
  }

 generatePDF(): void {
  if (this.cart.length === 0) {
    this.showToast('error', 'Aucun article à exporter');
    return;
  }

  this.isLoading = true;

  setTimeout(() => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("ESTIMATION DE VOLUME", 10, 10);

    let yPosition = 20;

    const tableData = this.cart.map(item => {
      const category = Object.keys(this.categories).find(cat =>
        this.categories[cat].some(catItem => catItem.name === item.name)
      );

      return [
        item.name,
        `x ${item.quantity}`,
        category || "N/A",
        `${(item.volume * item.quantity).toFixed(2)} m³`
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Article', 'Quantité', 'Catégorie', 'Volume']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 195, 4] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 30;

    doc.setFontSize(14);
    doc.text(`Total: ${this.totalVolume.toFixed(2)} m³`, 10, finalY + 10);

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR');

    doc.setFontSize(10);
    doc.text(`Généré le: ${dateStr} à ${timeStr}`, 10, finalY + 20);

    doc.save(`volume_estimation_${new Date().toISOString().slice(0,10)}.pdf`);

    this.isLoading = false;
    this.showToast('success', 'PDF généré avec succès');
  }, 1000);
}
  clearCart(): void {
    this.cart = [];
    this.totalVolume = 0;
    
    // Reset quantities in all categories
    Object.keys(this.categories).forEach(category => {
      this.categories[category].forEach(item => {
        item.quantity = 0;
      });
    });
    
    this.showToast('success', 'Sélection vidée');
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  validateQuantity(item: Item, event: any): void {
    const input = event.target;
    let value = parseInt(input.value) || 0;
    
    if (value < 0) value = 0;
    if (value > 99) value = 99;
    
    input.value = value;
    this.onQuantityChange(item, event);
  }

  onImageError(event: any): void {
    // Set a default image when image fails to load
    event.target.src = 'assets/images/default-item.png';
  }

  private updateTotalVolume(): void {
    this.totalVolume = this.cart.reduce((total, item) => {
      return total + (item.volume * item.quantity);
    }, 0);
    
    this.totalVolume = parseFloat(this.totalVolume.toFixed(2));
  }

  showToast(type: 'success' | 'error' | 'info', message: string): void {
    const toast: Toast = {
      id: Date.now().toString(),
      type,
      message
    };
    
    this.toasts.push(toast);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      this.removeToast(toast);
    }, 3000);
  }

  removeToast(toast: Toast): void {
    const index = this.toasts.findIndex(t => t.id === toast.id);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }

  // TrackBy functions for performance optimization
  trackByItem(index: number, item: Item): string {
    return item.name; // Using name as unique identifier
  }

  trackByCartItem(index: number, item: Item): string {
    return item.name; // Using name as unique identifier
  }

  // Utility function to stop event propagation
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}