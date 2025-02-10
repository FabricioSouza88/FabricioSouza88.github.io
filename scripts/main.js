const site = {
    toggleExpandable: function (status) {
        const elements = document.getElementsByClassName("expandable");
        for(const elementPos in elements) {
            const element = elements[elementPos];
            const expandableContent = element.getElementsByClassName("expandable-content")[0];
            const btnMore = element.getElementsByClassName("expandable-btn more")[0];
            const btnLess = element.getElementsByClassName("expandable-btn less")[0];
            if (status === 'open') {
                btnMore.classList.remove('active');
                btnLess.classList.add('active');
                expandableContent.classList.add('active');
            } else {
                btnMore.classList.add('active');
                btnLess.classList.remove('active');
                expandableContent.classList.remove('active');
            }
        };
    }
}