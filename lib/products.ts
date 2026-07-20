export type Product = {id:string; name:string; description:string; price:number; weight:string; protein:string; badge:string; inStock:boolean; accent:string};
export const products: Product[] = [
{id:'soia-original',name:'SOIA Original',description:'Rasa gurih ringan untuk teman ngemil sehari-hari.',price:25000,weight:'100 gram',protein:'18 g',badge:'Best Seller',inStock:true,accent:'#d9b66f'},
{id:'soia-seaweed',name:'SOIA Seaweed',description:'Gurih rumput laut dengan rasa umami yang seimbang.',price:28000,weight:'100 gram',protein:'18 g',badge:'Umami',inStock:true,accent:'#2f8060'},
{id:'soia-kecombrang',name:'SOIA Kecombrang',description:'Aroma rempah kecombrang yang unik dan lebih berani.',price:30000,weight:'100 gram',protein:'18 g',badge:'Signature',inStock:true,accent:'#c15d48'}
];
export const productById = new Map(products.map((p)=>[p.id,p]));
