import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableWithoutFeedback,
    ListView,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native'

import { 
    List, 
    ListItem, 
    Icon,
    Text
} from 'react-native-elements';

import TopHeader from '../top-header-view';
import OperationView from './sections/operationview';

import { fetchPortCallOperations } from '../../actions';
import { getTimeDifferenceString } from '../../util/timeservices';
import colorScheme from '../../config/colors';

const timer = null;
const portCallId = null;

class TimeLineView extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        
        this.state = {
            dataSource: ds.cloneWithRows(['row 1, row 2']),
            refreshing: false,
        }

        this.goToStateList = this.goToStateList.bind(this);
    }

    componentWillMount() {
        portCallId = this.props.portCallId;
        timer = setInterval(() => this.loadOperations, 60000);

        this.loadOperations = this.loadOperations.bind(this);
        this.loadOperations();
    }

    loadOperations() {
        this.props.fetchPortCallOperations(portCallId).then(() => {
            if(this.props.error.hasError)
                navigate('Error');
        }); 
    }

    componentWillUnmount() {
        clearInterval(timer);
    }

    goToStateList = () => {
        this.props.navigation.navigate('FavoriteStates');
    }

    render() {
        const { loading, operations, vesselName } = this.props;
        const {params} = this.props.navigation.state;
        let { dataSource } = this.state;

        if(!loading) dataSource = dataSource.cloneWithRows(operations);

        return(
            <View style={{flex: 1, backgroundColor: colorScheme.primaryContainerColor}}>
                <TopHeader title = 'Timeline' firstPage navigation={this.props.navigation} rightIconFunction={this.goToStateList}/>

                <View 
                    style={styles.headerContainer}
                >
                    <Text style={styles.headerText}>{vesselName}</Text>
                    {operations.reliability >= 0 && 
                        <Text style={styles.headerTitleText}><Text style={{fontWeight: 'bold'}}>Reliability: </Text>{operations.reliability}%</Text>
                    }
                </View>

                {loading && <ActivityIndicator 
                                color={colorScheme.primaryColor}
                                style={{alignSelf: 'center'}}
                                animating={loading}
                                size='large'/>}
                {!loading && <ListView
                                enableEmptySections
                                dataSource={dataSource} 
                                refreshControl = {
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.loadOperations.bind(this)}
                                    />
                                }
                                renderRow={(data, sectionId, rowId) => {
                                    if(typeof data == 'number') return null; // disgusting way to not handle operations.reliability as a member of the dataset for operations
                                    return <OperationView 
                                        operation={data} 
                                        rowNumber={rowId}
                                        navigation={this.props.navigation}
                                        vesselName={vesselName}
                                        />
                                    }                
                                }
                            />
                }
            </View>
        );
    }
}


const styles = StyleSheet.create ({

    headerContainer: {
        backgroundColor: colorScheme.primaryColor,
        alignItems: 'center',

    },
    headerText: {
        textAlign: 'center',
        fontSize: 20,
        color: colorScheme.primaryTextColor,
    },
    headerTitleText: {
        textAlign: 'center',
        color: colorScheme.secondaryContainerColor,
        fontSize: 12,
   },
});



function mapStateToProps(state) {
    return {
        loading: state.portCalls.selectedPortCallIsLoading,
        operations: state.portCalls.selectedPortCallOperations,
        vesselName: state.portCalls.vessel.name,
        portCallId: state.portCalls.selectedPortCall.portCallId,
        error: state.error,
    };
}

export default connect(mapStateToProps, {fetchPortCallOperations})(TimeLineView);




