import "./Loading.css";

const Loading = ({ style }) => {
    return (
        <div className="loading-wrapper" style={style}>
            <div className="loading-circle"></div>
            <p className="loading-text">Yükleniyor...</p>
        </div>
    );
};

export default Loading;
