// Supporting components
import '../ids-list-view';
import productsJSON from '../../../assets/data/products-100.json';

// Example for populating the List View
const listView: any = document.querySelector('#demo-lv-selectable-multiple');

if (listView) {
  // Do an ajax request and apply the data to the list
  const url: any = productsJSON;
  let allData: any = [];
  let initialCopy: any = [];

  const setData = async () => {
    const res = await fetch(url);
    const data = await res.json();

    initialCopy = [...data];
    initialCopy = [...initialCopy, ...data];
    allData = [...initialCopy];

    initialCopy.selected = true;
    listView.data = allData;
    console.info('List Has', allData.length, 'items');
  };

  listView.addEventListener('selected', (e: any) => {
    console.info('selected event called', e.detail);
  });
  listView.addEventListener('activated', (e: any) => {
    console.info('activated event called', e.detail);
  });
  listView.addEventListener('click', (e: any) => {
    console.info('clicked event called', e.detail);
  });
  listView.addEventListener('deselected', (e: any) => {
    console.info('deselected event called', e.detail);
  });

  document.querySelector('#add-more')!.addEventListener('click', async () => {
    const dataCopy = [...initialCopy];
    allData = [...allData, ...dataCopy];
    listView.data = allData;
    console.info('added more data', allData.length);
  });
  await setData();
}
