
/* Les lignes d'un tableau alternent comme les cases d'une colonne
   d'échiquier. Zébrure fonctionnelle autant que thématique. */
export function squareTint (index: number){
  return index % 2 === 1 
  ? 'bg-[#F6F4F0] dark:bg-white/[0.03]' 
  : 'bg-white dark:bg-transparent';
}
