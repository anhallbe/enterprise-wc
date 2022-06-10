// Supporting components
import '../ids-list-view';
import productsJSON from '../../../assets/data/products.json';

// Example for populating the List View
const listView: any = document.querySelector('#demo-lv-selectable-single');

if (listView) {
  // Do an ajax request and apply the data to the list
  const url: any = productsJSON;

  const setData = async () => {
    const res = await fetch(url);
    const data = await res.json();
    listView.data = data;
  };

  setData();
}
